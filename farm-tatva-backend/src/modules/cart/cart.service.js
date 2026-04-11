import prisma from "../../config/db.js";

// Get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
};

// Add to cart
export const addToCart = async (userId, productId, quantity) => {
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
      data: { quantity: existingItem.quantity + quantity },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });
};

// Get cart
export const getCart = async (userId) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
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
