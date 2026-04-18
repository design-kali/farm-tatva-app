import express from "express";
import { listDeliveryAreas } from "./delivery-area.controller.js";

const router = express.Router();

router.get("/", listDeliveryAreas);

export default router;
