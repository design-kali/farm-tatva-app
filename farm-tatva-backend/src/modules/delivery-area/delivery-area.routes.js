import express from "express";
import {
  listDeliveryAreas,
  addDeliveryArea,
  editDeliveryArea,
  removeDeliveryArea,
} from "./delivery-area.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", listDeliveryAreas);
router.post("/", authMiddleware, requireRole(["ADMIN"]), addDeliveryArea);
router.put("/:id", authMiddleware, requireRole(["ADMIN"]), editDeliveryArea);
router.delete("/:id", authMiddleware, requireRole(["ADMIN"]), removeDeliveryArea);

export default router;
