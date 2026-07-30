import { Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { folders, bookmarks } from "../db/schema.js";
import { AuthRequest } from "../types/index.js";

export const getFolders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const userFolders = await db
      .select({
        id: folders.id,
        name: folders.name,
        createdAt: folders.createdAt,
        bookmarkCount: sql<number>`cast(count(${bookmarks.id}) as integer)`,
      })
      .from(folders)
      .leftJoin(bookmarks, eq(bookmarks.folderId, folders.id))
      .where(eq(folders.userId, userId))
      .groupBy(folders.id)
      .orderBy(folders.name);

    res.json({ folders: userFolders });
  } catch (error) {
    console.error("Get folders error:", error);
    res.status(500).json({ error: "Failed to retrieve folders" });
  }
};

export const getFolderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const folderId = parseInt(req.params.id as string, 10);

    if (isNaN(folderId)) {
      res.status(400).json({ error: "Invalid folder ID" });
      return;
    }

    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .limit(1);

    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.json({ folder });
  } catch (error) {
    console.error("Get folder error:", error);
    res.status(500).json({ error: "Failed to retrieve folder" });
  }
};

export const createFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name } = req.body;

    const [newFolder] = await db
      .insert(folders)
      .values({
        name,
        userId,
      })
      .returning();

    res.status(201).json({
      message: "Folder created successfully",
      folder: { ...newFolder, bookmarkCount: 0 },
    });
  } catch (error) {
    console.error("Create folder error:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
};

export const updateFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const folderId = parseInt(req.params.id as string, 10);
    const { name } = req.body;

    if (isNaN(folderId)) {
      res.status(400).json({ error: "Invalid folder ID" });
      return;
    }

    const [updated] = await db
      .update(folders)
      .set({ name })
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.json({
      message: "Folder renamed successfully",
      folder: updated,
    });
  } catch (error) {
    console.error("Update folder error:", error);
    res.status(500).json({ error: "Failed to update folder" });
  }
};

export const deleteFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const folderId = parseInt(req.params.id as string, 10);

    if (isNaN(folderId)) {
      res.status(400).json({ error: "Invalid folder ID" });
      return;
    }

    // FR-17: Deleting a folder shall not silently delete its bookmarks.
    // Unlink bookmarks first to explicitly guarantee they become uncategorized.
    await db
      .update(bookmarks)
      .set({ folderId: null })
      .where(and(eq(bookmarks.folderId, folderId), eq(bookmarks.userId, userId)));

    const [deleted] = await db
      .delete(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.json({
      message: "Folder deleted successfully. Its bookmarks have been preserved as uncategorized.",
      folder: deleted,
    });
  } catch (error) {
    console.error("Delete folder error:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
};
