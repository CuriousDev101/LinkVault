import { Response } from "express";
import { and, desc, asc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookmarks, folders, tags, bookmarkTags } from "../db/schema.js";
import { AuthRequest } from "../types/index.js";

interface TagItem {
  id: number;
  name: string;
}

// Helper to fetch tags for a list of bookmark IDs
async function attachTagsToBookmarks(
  bookmarkList: Array<typeof bookmarks.$inferSelect & { folderName?: string | null }>
) {
  if (bookmarkList.length === 0) return [];

  const bookmarkIds = bookmarkList.map((b) => b.id);

  const tagRows = await db
    .select({
      bookmarkId: bookmarkTags.bookmarkId,
      tagId: tags.id,
      tagName: tags.name,
    })
    .from(bookmarkTags)
    .innerJoin(tags, eq(tags.id, bookmarkTags.tagId))
    .where(inArray(bookmarkTags.bookmarkId, bookmarkIds));

  const tagsByBookmark = new Map<number, TagItem[]>();
  for (const row of tagRows) {
    if (!tagsByBookmark.has(row.bookmarkId)) {
      tagsByBookmark.set(row.bookmarkId, []);
    }
    tagsByBookmark.get(row.bookmarkId)!.push({
      id: row.tagId,
      name: row.tagName,
    });
  }

  return bookmarkList.map((b) => ({
    ...b,
    tags: tagsByBookmark.get(b.id) || [],
  }));
}

// Helper to process tags (names) for a user and link to bookmark
async function syncBookmarkTags(
  bookmarkId: number,
  userId: number,
  tagNames?: string[]
) {
  // Always clear existing associations first
  await db
    .delete(bookmarkTags)
    .where(eq(bookmarkTags.bookmarkId, bookmarkId));

  if (!tagNames || tagNames.length === 0) return;

  // Normalize unique non-empty tag names
  const cleanTagNames = Array.from(
    new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean))
  );

  for (const tagName of cleanTagNames) {
    // Find or create tag
    let [tag] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.userId, userId), eq(tags.name, tagName)))
      .limit(1);

    if (!tag) {
      [tag] = await db
        .insert(tags)
        .values({
          name: tagName,
          userId,
        })
        .returning();
    }

    // Insert association
    await db
      .insert(bookmarkTags)
      .values({
        bookmarkId,
        tagId: tag.id,
      })
      .onConflictDoNothing();
  }
}

export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      search,
      folderId,
      tagId,
      tagName,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const conditions = [eq(bookmarks.userId, userId)];

    // Folder filtering
    if (folderId) {
      if (folderId === "unorganized" || folderId === "null") {
        conditions.push(isNull(bookmarks.folderId));
      } else {
        const parsedFolderId = parseInt(folderId as string, 10);
        if (!isNaN(parsedFolderId)) {
          conditions.push(eq(bookmarks.folderId, parsedFolderId));
        }
      }
    }

    // Tag filtering
    if (tagId) {
      const parsedTagId = parseInt(tagId as string, 10);
      if (!isNaN(parsedTagId)) {
        const taggedBookmarkIds = await db
          .select({ bookmarkId: bookmarkTags.bookmarkId })
          .from(bookmarkTags)
          .where(eq(bookmarkTags.tagId, parsedTagId));

        const ids = taggedBookmarkIds.map((r) => r.bookmarkId);
        if (ids.length === 0) {
          res.json({ bookmarks: [] });
          return;
        }
        conditions.push(inArray(bookmarks.id, ids));
      }
    } else if (tagName) {
      const name = (tagName as string).trim().toLowerCase();
      const taggedBookmarkIds = await db
        .select({ bookmarkId: bookmarkTags.bookmarkId })
        .from(bookmarkTags)
        .innerJoin(tags, eq(tags.id, bookmarkTags.tagId))
        .where(and(eq(tags.userId, userId), eq(tags.name, name)));

      const ids = taggedBookmarkIds.map((r) => r.bookmarkId);
      if (ids.length === 0) {
        res.json({ bookmarks: [] });
        return;
      }
      conditions.push(inArray(bookmarks.id, ids));
    }

    // Search filtering: search by title, URL, description, or tag
    if (search && typeof search === "string" && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;

      // Find bookmarks matching tag name
      const matchingTags = await db
        .select({ bookmarkId: bookmarkTags.bookmarkId })
        .from(bookmarkTags)
        .innerJoin(tags, eq(tags.id, bookmarkTags.tagId))
        .where(and(eq(tags.userId, userId), ilike(tags.name, searchTerm)));

      const bookmarkIdsFromTags = matchingTags.map((r) => r.bookmarkId);

      const searchConditions = [
        ilike(bookmarks.title, searchTerm),
        ilike(bookmarks.url, searchTerm),
        ilike(bookmarks.description, searchTerm),
      ];

      if (bookmarkIdsFromTags.length > 0) {
        searchConditions.push(inArray(bookmarks.id, bookmarkIdsFromTags));
      }

      conditions.push(or(...searchConditions)!);
    }

    // Sorting
    const orderFn = sortOrder === "asc" ? asc : desc;
    const sortExpression =
      sortBy === "title"
        ? orderFn(bookmarks.title)
        : sortBy === "updatedAt"
        ? orderFn(bookmarks.updatedAt)
        : orderFn(bookmarks.createdAt);

    const baseQuery = db
      .select({
        id: bookmarks.id,
        userId: bookmarks.userId,
        folderId: bookmarks.folderId,
        folderName: folders.name,
        title: bookmarks.title,
        url: bookmarks.url,
        description: bookmarks.description,
        createdAt: bookmarks.createdAt,
        updatedAt: bookmarks.updatedAt,
      })
      .from(bookmarks)
      .leftJoin(folders, eq(folders.id, bookmarks.folderId))
      .where(and(...conditions))
      .orderBy(sortExpression);

    const result = await baseQuery;
    const bookmarksWithTags = await attachTagsToBookmarks(result);

    res.json({ bookmarks: bookmarksWithTags });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ error: "Failed to retrieve bookmarks" });
  }
};

export const getBookmarkById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const bookmarkId = parseInt(req.params.id as string, 10);

    if (isNaN(bookmarkId)) {
      res.status(400).json({ error: "Invalid bookmark ID" });
      return;
    }

    const [bookmark] = await db
      .select({
        id: bookmarks.id,
        userId: bookmarks.userId,
        folderId: bookmarks.folderId,
        folderName: folders.name,
        title: bookmarks.title,
        url: bookmarks.url,
        description: bookmarks.description,
        createdAt: bookmarks.createdAt,
        updatedAt: bookmarks.updatedAt,
      })
      .from(bookmarks)
      .leftJoin(folders, eq(folders.id, bookmarks.folderId))
      .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
      .limit(1);

    if (!bookmark) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }

    const [withTags] = await attachTagsToBookmarks([bookmark]);

    res.json({ bookmark: withTags });
  } catch (error) {
    console.error("Get bookmark error:", error);
    res.status(500).json({ error: "Failed to retrieve bookmark" });
  }
};

export const createBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, url, description, folderId, tags: tagList } = req.body;

    // Verify folder belongs to user if specified
    if (folderId) {
      const [userFolder] = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
        .limit(1);

      if (!userFolder) {
        res.status(400).json({ error: "Selected folder does not exist" });
        return;
      }
    }

    const [newBookmark] = await db
      .insert(bookmarks)
      .values({
        userId,
        folderId: folderId || null,
        title,
        url,
        description: description || null,
      })
      .returning();

    // Attach tags
    if (tagList && Array.isArray(tagList)) {
      await syncBookmarkTags(newBookmark.id, userId, tagList);
    }

    const [fullBookmark] = await attachTagsToBookmarks([newBookmark]);

    res.status(201).json({
      message: "Bookmark created successfully",
      bookmark: fullBookmark,
    });
  } catch (error) {
    console.error("Create bookmark error:", error);
    res.status(500).json({ error: "Failed to create bookmark" });
  }
};

export const updateBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const bookmarkId = parseInt(req.params.id as string, 10);
    const { title, url, description, folderId, tags: tagList } = req.body;

    if (isNaN(bookmarkId)) {
      res.status(400).json({ error: "Invalid bookmark ID" });
      return;
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }

    // Verify folder ownership if changing folder
    if (folderId) {
      const [userFolder] = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
        .limit(1);

      if (!userFolder) {
        res.status(400).json({ error: "Selected folder does not exist" });
        return;
      }
    }

    const [updated] = await db
      .update(bookmarks)
      .set({
        title: title !== undefined ? title : existing.title,
        url: url !== undefined ? url : existing.url,
        description: description === undefined ? existing.description : description,
        folderId: folderId !== undefined ? (folderId || null) : existing.folderId,
        updatedAt: new Date(),
      })
      .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
      .returning();

    // Sync tags if provided
    if (tagList !== undefined && Array.isArray(tagList)) {
      await syncBookmarkTags(bookmarkId, userId, tagList);
    }

    const [fullBookmark] = await attachTagsToBookmarks([updated]);

    res.json({
      message: "Bookmark updated successfully",
      bookmark: fullBookmark,
    });
  } catch (error) {
    console.error("Update bookmark error:", error);
    res.status(500).json({ error: "Failed to update bookmark" });
  }
};

export const deleteBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const bookmarkId = parseInt(req.params.id as string, 10);

    if (isNaN(bookmarkId)) {
      res.status(400).json({ error: "Invalid bookmark ID" });
      return;
    }

    const [deleted] = await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }

    res.json({
      message: "Bookmark deleted successfully",
      bookmark: deleted,
    });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    res.status(500).json({ error: "Failed to delete bookmark" });
  }
};
