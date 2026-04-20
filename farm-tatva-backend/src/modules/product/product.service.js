import prisma from "../../config/db.js";

const toNonNegativeInt = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error("Stock values must be non-negative numbers");
  }

  return Math.floor(parsedValue);
};

export const createProduct = async (data) => {
  const productName = data.name?.trim();

  if (!productName) {
    throw new Error("Product name is required");
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      name: productName,
    },
  });

  const resolvedStock = toNonNegativeInt(data.stock, existingProduct?.stock ?? 0);
  const resolvedMaxStock = Math.max(
    toNonNegativeInt(data.maxStock, existingProduct?.maxStock ?? resolvedStock),
    resolvedStock,
  );

  const productData = {
    ...data,
    name: productName,
    stock: resolvedStock,
    maxStock: resolvedMaxStock,
  };

  return prisma.product.upsert({
    where: {
      name: productName,
    },
    update: productData,
    create: productData,
    include: {
      category: true,
    },
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

export const updateProduct = async (id, data) => {
  const updateData = { ...data };
  if (data.stock !== undefined) {
    updateData.stock = toNonNegativeInt(data.stock);
  }
  if (data.maxStock !== undefined) {
    updateData.maxStock = toNonNegativeInt(data.maxStock);
  }
  if (updateData.maxStock && updateData.stock) {
    updateData.maxStock = Math.max(updateData.maxStock, updateData.stock);
  }
  return prisma.product.update({
    where: { id },
    data: updateData,
    include: { category: true },
  });
};

export const deleteProduct = async (id) => {
  return prisma.product.delete({
    where: { id },
  });
};
