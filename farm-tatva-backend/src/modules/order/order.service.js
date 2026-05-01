import prisma from "../../config/db.js";
import {
  ORDER_STATUSES,
  VALID_ORDER_TRANSITIONS,
} from "../../utils/order-constants.js";
import { serializeUser } from "../user/user.utils.js";
import {
  calculatePricingBreakdown,
  roundNumber,
} from "../product/pricing.utils.js";

const orderInclude = {
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
    include: {
      product: {
        include: {
          images: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      pricingOption: true,
    },
  },
};

const serializeOrder = (order) => ({
  ...order,
  subtotal: Number(order.subtotal ?? 0),
  discount: Number(order.discount ?? 0),
  total: Number(order.total ?? 0),
  user: serializeUser(order.user),
  items: (order.items || []).map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
    discount: Number(item.discount),
    total: Number(item.total),
  })),
});

export const getOrders = async (userId, isAdmin = false) => {
  const orders = await prisma.order.findMany({
    where: isAdmin ? undefined : { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: orderInclude,
  });

  return orders.map(serializeOrder);
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
    const address = await tx.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new Error("Invalid address");
    }

    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            pricingOption: {
              include: {
                offers: {
                  orderBy: [{ minQuantity: "asc" }, { createdAt: "asc" }],
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const orderItems = [];

    for (const item of cart.items) {
      const quantity = Number(item.quantity);
      const inventoryRequired = roundNumber(
        quantity * Number(item.pricingOption.inventoryFactor),
      );
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: {
            gte: inventoryRequired,
          },
        },
        data: {
          stock: {
            decrement: inventoryRequired,
          },
        },
      });

      if (updated.count === 0) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }

      const pricing = calculatePricingBreakdown(item.pricingOption, quantity);

      orderItems.push({
        productId: item.productId,
        pricingOptionId: item.pricingOptionId,
        quantity,
        unit: item.pricingOption.unit,
        optionLabel: item.pricingOption.label,
        unitPrice: Number(item.pricingOption.price),
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        total: pricing.total,
      });
    }

    const subtotal = roundNumber(
      orderItems.reduce((sum, item) => sum + item.subtotal, 0),
      2,
    );
    const discount = roundNumber(
      orderItems.reduce((sum, item) => sum + item.discount, 0),
      2,
    );
    const total = roundNumber(
      orderItems.reduce((sum, item) => sum + item.total, 0),
      2,
    );

    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        subtotal,
        discount,
        total,
        items: {
          create: orderItems,
        },
      },
      include: orderInclude,
    });

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return serializeOrder(order);
  });
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const allowedTransitions = VALID_ORDER_TRANSITIONS[order.status] || [];
  if (!allowedTransitions.includes(status)) {
    throw new Error(`Cannot move from ${order.status} to ${status}`);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: orderInclude,
  });

  return serializeOrder(updatedOrder);
};
