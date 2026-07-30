import { Router } from "express";
import {
  getBookmarks,
  getBookmarkById,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from "../controllers/bookmark.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { bookmarkSchema, updateBookmarkSchema } from "../validations/index.js";

const router = Router();

router.use(requireAuth);

router.get("/", getBookmarks);
router.get("/:id", getBookmarkById);
router.post("/", validateBody(bookmarkSchema), createBookmark);
router.put("/:id", validateBody(updateBookmarkSchema), updateBookmark);
router.delete("/:id", deleteBookmark);

export default router;
