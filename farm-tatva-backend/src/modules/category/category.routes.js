import express from "express";
import { addCategory, listCategories } from "./category.controller.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole(["ADMIN"]), addCategory);
router.get("/", listCategories);

export default router;
