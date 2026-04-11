import express from "express";
import { addProduct, listProducts, getProduct } from "./product.controller.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole(["ADMIN"]), addProduct);
router.get("/", listProducts);
router.get("/:id", getProduct);

export default router;
