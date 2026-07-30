import { Router } from "express";
import {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
} from "../controllers/folder.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { folderSchema } from "../validations/index.js";

const router = Router();

router.use(requireAuth);

router.get("/", getFolders);
router.get("/:id", getFolderById);
router.post("/", validateBody(folderSchema), createFolder);
router.put("/:id", validateBody(folderSchema), updateFolder);
router.delete("/:id", deleteFolder);

export default router;
