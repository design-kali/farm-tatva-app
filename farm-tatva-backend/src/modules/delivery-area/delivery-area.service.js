import prisma from "../../config/db.js";

export const getDeliveryAreas = async () => {
  return prisma.deliveryArea.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
};

export const createDeliveryArea = async (data) => {
  return prisma.deliveryArea.create({ data });
};

export const updateDeliveryArea = async (id, data) => {
  return prisma.deliveryArea.update({
    where: { id },
    data,
  });
};

export const deleteDeliveryArea = async (id) => {
  return prisma.deliveryArea.delete({
    where: { id },
  });
};

