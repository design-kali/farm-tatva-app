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

