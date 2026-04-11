import prisma from "../../config/db.js";

export const createAddress = async (userId, data) => {
  return prisma.address.create({
    data: {
      userId,
      ...data,
    },
  });
};

export const getUserAddresses = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
  });
};

export const deleteAddress = async (userId, addressId) => {
  return prisma.address.delete({
    where: {
      id: addressId,
      userId, // ensures user owns it
    },
  });
};
