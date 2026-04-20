import express from "express";
import { addCategory, listCategories, editCategory, removeCategory } from "./category.controller.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole(["ADMIN"]), addCategory);
router.get("/", listCategories);
router.put("/:id", authMiddleware, requireRole(["ADMIN"]), editCategory);
router.delete("/:id", authMiddleware, requireRole(["ADMIN"]), removeCategory);

export default router;
