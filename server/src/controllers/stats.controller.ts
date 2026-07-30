import { Response } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookmarks, folders, tags, bookmarkTags } from "../db/schema.js";
import { AuthRequest } from "../types/index.js";

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const [bookmarkCountResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    const [folderCountResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(folders)
      .where(eq(folders.userId, userId));

    const [tagCountResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(tags)
      .where(eq(tags.userId, userId));

    // Get 5 most recent bookmarks
    const recentBookmarks = await db
      .select({
        id: bookmarks.id,
        title: bookmarks.title,
        url: bookmarks.url,
        description: bookmarks.description,
        folderId: bookmarks.folderId,
        folderName: folders.name,
        createdAt: bookmarks.createdAt,
        updatedAt: bookmarks.updatedAt,
      })
      .from(bookmarks)
      .leftJoin(folders, eq(folders.id, bookmarks.folderId))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt))
      .limit(5);

    // Attach tags to recent bookmarks
    let recentWithTags = recentBookmarks.map((b) => ({ ...b, tags: [] as { id: number; name: string }[] }));
    if (recentBookmarks.length > 0) {
      const recentIds = recentBookmarks.map((b) => b.id);
      const tagRows = await db
        .select({
          bookmarkId: bookmarkTags.bookmarkId,
          tagId: tags.id,
          tagName: tags.name,
        })
        .from(bookmarkTags)
        .innerJoin(tags, eq(tags.id, bookmarkTags.tagId))
        .where(sql`${bookmarkTags.bookmarkId} in ${recentIds}`);

      const tagMap = new Map<number, { id: number; name: string }[]>();
      for (const row of tagRows) {
        if (!tagMap.has(row.bookmarkId)) tagMap.set(row.bookmarkId, []);
        tagMap.get(row.bookmarkId)!.push({ id: row.tagId, name: row.tagName });
      }

      recentWithTags = recentBookmarks.map((b) => ({
        ...b,
        tags: tagMap.get(b.id) || [],
      }));
    }

    res.json({
      stats: {
        totalBookmarks: bookmarkCountResult?.count || 0,
        totalFolders: folderCountResult?.count || 0,
        totalTags: tagCountResult?.count || 0,
      },
      recentBookmarks: recentWithTags,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to retrieve dashboard stats" });
  }
};
