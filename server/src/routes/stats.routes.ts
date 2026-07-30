import { Router } from "express";
import { getDashboardStats } from "../controllers/stats.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", getDashboardStats);

export default router;
