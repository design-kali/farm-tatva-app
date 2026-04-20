import express from "express";
import { listUsers, editUser, removeUser } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, requireRole(["ADMIN"]), listUsers);
router.put("/:id", authMiddleware, requireRole(["ADMIN"]), editUser);
router.delete("/:id", authMiddleware, requireRole(["ADMIN"]), removeUser);

export default router;
