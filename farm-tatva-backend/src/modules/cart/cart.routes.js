import express from "express";
import {
  addItem,
  getUserCart,
  updateItem,
  removeItem,
} from "./cart.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All cart routes require login
router.use(authMiddleware);

router.get("/", getUserCart);
router.post("/", addItem);
router.put("/", updateItem);
router.delete("/:cartItemId", removeItem);

export default router;
