import express from "express";
import {
  createOrder,
  listOrders,
  changeOrderStatus,
} from "./order.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

// User routes
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, listOrders);

// Admin route
router.put(
  "/status",
  authMiddleware,
  requireRole(["ADMIN"]),
  changeOrderStatus,
);

export default router;
