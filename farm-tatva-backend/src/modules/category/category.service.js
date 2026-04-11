import prisma from "../../config/db.js";

export const createCategory = async (data) => {
  return prisma.category.create({ data });
};

export const getCategories = async () => {
  return prisma.category.findMany();
};
