import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bookmarkRoutes from "./bookmark.routes.js";
import folderRoutes from "./folder.routes.js";
import tagRoutes from "./tag.routes.js";
import statsRoutes from "./stats.routes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/bookmarks", bookmarkRoutes);
apiRouter.use("/folders", folderRoutes);
apiRouter.use("/tags", tagRoutes);
apiRouter.use("/stats", statsRoutes);

export default apiRouter;
