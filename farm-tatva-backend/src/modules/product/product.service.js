import prisma from "../../config/db.js";
import {
  normalizePricingOptionsInput,
  serializeProduct,
  toNonNegativeNumber,
} from "./pricing.utils.js";

const productInclude = {
  category: true,
  images: {
    orderBy: { createdAt: "asc" },
  },
  pricingOptions: {
    include: {
      offers: {
        orderBy: [{ minQuantity: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
};

const buildProductPayload = (data, existingProduct) => {
  const productName = data.name?.trim();

  if (!productName) {
    throw new Error("Product name is required");
  }

  const stock = toNonNegativeNumber(
    data.stock,
    "Stock",
    Number(existingProduct?.stock ?? 0),
  );
  const maxStock = Math.max(
    toNonNegativeNumber(
      data.maxStock,
      "Max stock",
      Number(existingProduct?.maxStock ?? stock),
    ),
    stock,
  );
  const inventoryUnit = String(
    data.inventoryUnit || existingProduct?.inventoryUnit || "kg",
  ).trim();

  if (!inventoryUnit) {
    throw new Error("Inventory unit is required");
  }

  const pricingOptions = normalizePricingOptionsInput(
    data.pricingOptions,
    data.price ?? existingProduct?.price,
    data.unit ?? existingProduct?.inventoryUnit ?? "unit",
  );

  return {
    name: productName,
    description: data.description?.trim() || null,
    categoryId: data.categoryId,
    stock,
    maxStock,
    inventoryUnit,
    pricingOptions,
  };
};

const savePricingOptions = async (tx, productId, pricingOptions) => {
  await tx.productOfferRule.deleteMany({
    where: { pricingOption: { productId } },
  });
  await tx.productPricingOption.deleteMany({
    where: { productId },
  });

  for (const option of pricingOptions) {
    await tx.productPricingOption.create({
      data: {
        productId,
        label: option.label,
        unit: option.unit,
        price: option.price,
        quantityStep: option.quantityStep,
        minQuantity: option.minQuantity,
        maxQuantity: option.maxQuantity,
        inventoryFactor: option.inventoryFactor,
        sortOrder: option.sortOrder,
        isDefault: option.isDefault,
        offers:
          option.offers.length > 0
            ? {
                create: option.offers.map((offer) => ({
                  minQuantity: offer.minQuantity,
                  discountType: offer.discountType,
                  discountValue: offer.discountValue,
                  isActive: offer.isActive,
                  startsAt: offer.startsAt,
                  endsAt: offer.endsAt,
                })),
              }
            : undefined,
      },
    });
  }
};

export const createProduct = async (data) => {
  const existingProduct = data.name
    ? await prisma.product.findUnique({
        where: { name: data.name.trim() },
        include: productInclude,
      })
    : null;
  const payload = buildProductPayload(data, existingProduct);
  const { pricingOptions, ...productFields } = payload;

  const product = await prisma.$transaction(async (tx) => {
    const upsertedProduct = await tx.product.upsert({
      where: { name: payload.name },
      update: productFields,
      create: productFields,
    });

    await savePricingOptions(tx, upsertedProduct.id, pricingOptions);

    return tx.product.findUnique({
      where: { id: upsertedProduct.id },
      include: productInclude,
    });
  });

  return serializeProduct(product);
};

export const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: productInclude,
  });

  return products.map(serializeProduct);
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  return serializeProduct(product);
};

export const updateProduct = async (id, data) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const payload = buildProductPayload(
    {
      ...existingProduct,
      ...data,
      pricingOptions: data.pricingOptions ?? existingProduct.pricingOptions,
    },
    existingProduct,
  );
  const { pricingOptions, ...productFields } = payload;

  const product = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: productFields,
    });

    await savePricingOptions(tx, id, pricingOptions);

    return tx.product.findUnique({
      where: { id },
      include: productInclude,
    });
  });

  return serializeProduct(product);
};

export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      orderItems: {
        select: {
          orderId: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.orderItems.length > 0) {
    throw new Error(
      `Cannot delete product. It is referenced in ${product.orderItems.length} order(s). Archive or mark as inactive instead.`,
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({
      where: { productId: id },
    });
    await tx.productOfferRule.deleteMany({
      where: { pricingOption: { productId: id } },
    });
    await tx.productPricingOption.deleteMany({
      where: { productId: id },
    });
    await tx.productImage.deleteMany({
      where: { productId: id },
    });

    return tx.product.delete({
      where: { id },
    });
  });
};

export const addProductImages = async (productId, imageData) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  await prisma.productImage.createMany({
    data: imageData,
  });

  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { createdAt: "asc" },
  });
};
