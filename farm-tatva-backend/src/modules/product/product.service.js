import prisma from "../../config/db.js";

export const createProduct = async (data) => {
  return prisma.product.create({
    data,
  });
};

export const getProducts = async () => {
  return prisma.product.findMany({
    include: {
      category: true,
    },
  });
};

export const getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
};
