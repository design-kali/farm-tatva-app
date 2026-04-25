import prisma from "../../config/db.js";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true,
          images: true,
        },
      },
    },
  },
};

// Get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  return cart;
};

// Add to cart
export const addToCart = async (userId, productId, quantity) => {
  const normalizedQuantity = Number(quantity);

  if (!productId) {
    throw new Error("Product is required");
  }

  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new Error("This product is no longer available.");
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + normalizedQuantity },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity: normalizedQuantity,
    },
  });
};

// Get cart
export const getCart = async (userId) => {
  return getOrCreateCart(userId);
};

// Update item quantity
export const updateCartItem = async (userId, productId, quantity) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  return prisma.cartItem.update({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    data: { quantity },
  });
};

// Remove item
export const removeFromCart = async (userId, productId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  return prisma.cartItem.delete({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });
};
