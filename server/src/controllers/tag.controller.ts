import { Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { tags, bookmarkTags } from "../db/schema.js";
import { AuthRequest } from "../types/index.js";

export const getTags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const userTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        bookmarkCount: sql<number>`cast(count(${bookmarkTags.bookmarkId}) as integer)`,
      })
      .from(tags)
      .leftJoin(bookmarkTags, eq(bookmarkTags.tagId, tags.id))
      .where(eq(tags.userId, userId))
      .groupBy(tags.id)
      .orderBy(tags.name);

    res.json({ tags: userTags });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ error: "Failed to retrieve tags" });
  }
};

export const createTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name } = req.body;
    const trimmedName = name.trim().toLowerCase();

    // Check if tag already exists for this user
    const [existing] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.userId, userId), eq(tags.name, trimmedName)))
      .limit(1);

    if (existing) {
      res.status(200).json({
        message: "Tag already exists",
        tag: { ...existing, bookmarkCount: 0 },
      });
      return;
    }

    const [newTag] = await db
      .insert(tags)
      .values({
        name: trimmedName,
        userId,
      })
      .returning();

    res.status(201).json({
      message: "Tag created successfully",
      tag: { ...newTag, bookmarkCount: 0 },
    });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
};

export const updateTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const tagId = parseInt(req.params.id as string, 10);
    const { name } = req.body;
    const trimmedName = name.trim().toLowerCase();

    if (isNaN(tagId)) {
      res.status(400).json({ error: "Invalid tag ID" });
      return;
    }

    // Check duplicate
    const [conflict] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.userId, userId), eq(tags.name, trimmedName)))
      .limit(1);

    if (conflict && conflict.id !== tagId) {
      res.status(409).json({ error: "A tag with this name already exists" });
      return;
    }

    const [updated] = await db
      .update(tags)
      .set({ name: trimmedName })
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    res.json({
      message: "Tag updated successfully",
      tag: updated,
    });
  } catch (error) {
    console.error("Update tag error:", error);
    res.status(500).json({ error: "Failed to update tag" });
  }
};

export const deleteTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const tagId = parseInt(req.params.id as string, 10);

    if (isNaN(tagId)) {
      res.status(400).json({ error: "Invalid tag ID" });
      return;
    }

    const [deleted] = await db
      .delete(tags)
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    res.json({
      message: "Tag deleted successfully",
      tag: deleted,
    });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
};
