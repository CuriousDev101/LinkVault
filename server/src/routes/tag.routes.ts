import { Router } from "express";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tag.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { tagSchema } from "../validations/index.js";

const router = Router();

router.use(requireAuth);

router.get("/", getTags);
router.post("/", validateBody(tagSchema), createTag);
router.put("/:id", validateBody(tagSchema), updateTag);
router.delete("/:id", deleteTag);

export default router;
