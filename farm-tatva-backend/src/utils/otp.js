import crypto from "crypto";
import bcrypt from "bcrypt";

export const generateOTP = (length = 4) => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
};

export const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

export const verifyOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

export const getOTPExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10);
  return new Date(Date.now() + minutes * 60 * 1000);
};
