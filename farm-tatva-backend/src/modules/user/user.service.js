import prisma from "../../config/db.js";
import {
  isValidMobileNumber,
  normalizeMobileNumber,
  serializeUser,
} from "./user.utils.js";

export const getUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return users.map(serializeUser);
};

export const updateUser = async (id, data) => {
  const nextData = {};

  if (typeof data.name === "string") {
    nextData.name = data.name.trim();
  }

  if (typeof data.email === "string") {
    nextData.email = data.email.trim();
  }

  if (typeof data.mobileNumber === "string") {
    const mobileNumber = normalizeMobileNumber(data.mobileNumber);

    if (!isValidMobileNumber(mobileNumber)) {
      throw new Error("Mobile number must be exactly 10 digits");
    }

    nextData.email = mobileNumber;
  }

  if (typeof data.role === "string") {
    nextData.role = data.role;
  }

  const user = await prisma.user.update({
    where: { id },
    data: nextData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return serializeUser(user);
};

export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id },
  });
};
