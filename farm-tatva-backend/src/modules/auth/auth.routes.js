import express from "express";
import {
  register,
  login,
  getProfile,
  sendOtp,
  verifyOtp,
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import smsService from "../../services/sms/index.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

router.post("/test-sms", async (req, res) => {
  try {
    const { phone } = req.body;

    const result = await smsService.sendSMS(
      phone,
      "Hello from FarmSatva! SMS Gateway is working successfully.",
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
