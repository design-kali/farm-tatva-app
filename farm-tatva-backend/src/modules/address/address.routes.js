import express from "express";
import {
  addAddress,
  listAddresses,
  removeAddress,
} from "./address.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addAddress);
router.get("/", listAddresses);
router.delete("/:id", removeAddress);

export default router;
