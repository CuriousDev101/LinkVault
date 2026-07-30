import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../validations/index.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", requireAuth, getProfile);
router.put("/profile", requireAuth, validateBody(updateProfileSchema), updateProfile);

export default router;
