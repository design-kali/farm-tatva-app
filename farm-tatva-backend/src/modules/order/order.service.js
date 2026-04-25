import prisma from "../../config/db.js";
import {
  ORDER_STATUSES,
  VALID_ORDER_TRANSITIONS,
} from "../../utils/order-constants.js";
import { serializeUser } from "../user/user.utils.js";

export const getOrders = async (userId, isAdmin = false) => {
  const orders = await prisma.order.findMany({
    where: isAdmin ? undefined : { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
      address: true,
      items: {
        include: { product: { include: { images: true } } },
      },
    },
  });

  return orders.map((order) => ({
    ...order,
    user: serializeUser(order.user),
  }));
};

export const getUserOrders = async (userId) => {
  return getOrders(userId, false);
};

export const getOrderMetadata = () => ({
  orderStatuses: Object.values(ORDER_STATUSES),
  validOrderTransitions: VALID_ORDER_TRANSITIONS,
});

export const placeOrder = async (userId, addressId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Validate address
    const address = await tx.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new Error("Invalid address");
    }

    // 2. Get cart
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { images: true } } },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // 3. 🔥 Atomic stock validation + deduction
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: {
            gte: item.quantity,
          },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (updated.count === 0) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }
    }

    // 4. Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    // 5. Create order
    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: true },
    });

    // 6. Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });
};

// Admin: update order status
export const updateOrderStatus = async (orderId, status) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!VALID_ORDER_TRANSITIONS[order.status].includes(status)) {
    throw new Error(`Cannot move from ${order.status} to ${status}`);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};
