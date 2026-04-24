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

  // Handle images separately
  const { images, ...productFields } = productData;

  const product = await prisma.product.upsert({
    where: {
      name: productName,
    },
    update: productFields,
    create: productFields,
    include: {
      category: true,
      images: true,
    },
  });

  // Handle images if provided
  if (images && Array.isArray(images) && images.length > 0) {
    // Delete existing images first
    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    // Create new images
    const imageData = images.map(imageUrl => ({
      productId: product.id,
      imageUrl: imageUrl.trim(),
    }));

    await prisma.productImage.createMany({
      data: imageData,
    });

    // Fetch updated product with images
    return prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  return product;
};

export const getProducts = async () => {
  return prisma.product.findMany({
    include: {
      category: true,
      images: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
};

export const getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: { 
      category: true,
      images: {
        orderBy: { createdAt: 'asc' },
      },
    },
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

  // Handle images separately
  const { images, ...productFields } = updateData;

  const product = await prisma.product.update({
    where: { id },
    data: productFields,
    include: { 
      category: true,
      images: true,
    },
  });

  // Handle images if provided
  if (images !== undefined) {
    if (Array.isArray(images) && images.length > 0) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Create new images
      const imageData = images.map(imageUrl => ({
        productId: id,
        imageUrl: imageUrl.trim(),
      }));

      await prisma.productImage.createMany({
        data: imageData,
      });
    } else if (images === null || images.length === 0) {
      // Delete all images if explicitly set to empty
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
    }
  }

  // Return updated product with images
  return prisma.product.findUnique({
    where: { id },
    include: { 
      category: true,
      images: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
};

export const deleteProduct = async (id) => {
  // Check if product exists
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

  // Check if product is referenced in any orders
  if (product.orderItems.length > 0) {
    throw new Error(
      `Cannot delete product. It is referenced in ${product.orderItems.length} order(s). Archive or mark as inactive instead.`,
    );
  }

  // Delete in transaction to ensure consistency
  return prisma.$transaction(async (tx) => {
    // Delete cart items referencing this product
    await tx.cartItem.deleteMany({
      where: { productId: id },
    });

    // Delete product images
    await tx.productImage.deleteMany({
      where: { productId: id },
    });

    // Delete the product
    return tx.product.delete({
      where: { id },
    });
  });
};

export const addProductImages = async (productId, imageData) => {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Create new images
  const createdImages = await prisma.productImage.createMany({
    data: imageData,
  });

  // Return the created images
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { createdAt: 'asc' },
  });
};
