import prisma from "../../config/db.js";
import bcrypt from "bcrypt";
import {
  isValidMobileNumber,
  normalizeMobileNumber,
  serializeUser,
} from "../user/user.utils.js";

export const registerUser = async (data) => {
  const mobileNumber = normalizeMobileNumber(data.mobileNumber);

  if (!data.name?.trim()) {
    throw new Error("Name is required");
  }

  if (!isValidMobileNumber(mobileNumber)) {
    throw new Error("Mobile number must be exactly 10 digits");
  }

  if (!data.password) {
    throw new Error("Password is required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: mobileNumber },
  });

  if (existingUser) {
    throw new Error("Mobile number already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: mobileNumber,
      password: hashedPassword,
    },
  });

  return serializeUser(user);
};

export const loginUser = async (identifier, password) => {
  const trimmedIdentifier =
    typeof identifier === "string" ? identifier.trim() : "";
  const lookupIdentifier = trimmedIdentifier.includes("@")
    ? trimmedIdentifier
    : normalizeMobileNumber(trimmedIdentifier);

  if (!lookupIdentifier) {
    throw new Error("User ID is required");
  }

  const user = await prisma.user.findUnique({
    where: { email: lookupIdentifier },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return serializeUser(user);
};

export const getUserProfileById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return serializeUser(user);
};
