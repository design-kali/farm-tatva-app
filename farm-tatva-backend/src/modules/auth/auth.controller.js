import { registerUser, loginUser, getUserProfileById } from "./auth.service.js";
import { generateToken } from "../../utils/jwt.js";

import prisma from "../../config/db.js";
import smsService from "../../services/sms/index.js";
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiry,
} from "../../utils/otp.js";

import { smsTemplates } from "../../services/sms/sms.templates.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    const token = generateToken(user);

    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const identifier =
      req.body.mobileNumber ?? req.body.email ?? req.body.userId;
    const user = await loginUser(identifier, req.body.password);
    const token = generateToken(user);

    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  const user = await getUserProfileById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
};

export const sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await prisma.otpVerification.create({
      data: {
        phone: mobileNumber,
        otpHash,
        expiresAt: getOTPExpiry(),
      },
    });

    const smsResult = await smsService.sendSMS(
      mobileNumber,
      smsTemplates.otp(otp),
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
      details: smsResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    const record = await prisma.otpVerification.findFirst({
      where: {
        phone: mobileNumber,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const isValid = await verifyOTP(otp, record.otpHash);

    if (!isValid) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
