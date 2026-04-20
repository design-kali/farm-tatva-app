import express from "express";
import {
  createOrder,
  listOrders,
  getOrderMetadata,
  changeOrderStatus,
} from "./order.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

// User routes
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, listOrders);

// Admin routes
router.get(
  "/meta",
  authMiddleware,
  requireRole(["ADMIN"]),
  getOrderMetadata,
);
router.put(
  "/status",
  authMiddleware,
  requireRole(["ADMIN"]),
  changeOrderStatus,
);

export default router;
