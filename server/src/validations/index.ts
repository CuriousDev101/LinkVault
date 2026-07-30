import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().trim().email("Invalid email address").toLowerCase().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

export const bookmarkSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Must be a valid HTTP or HTTPS URL" }
    ),
  description: z.string().trim().max(1000).optional().nullable(),
  folderId: z.coerce.number().int().positive().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(100)).optional(),
});

export const updateBookmarkSchema = bookmarkSchema.partial();

export const folderSchema = z.object({
  name: z.string().trim().min(1, "Folder name is required").max(255),
});

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required").max(100),
});
