import prisma from "../../config/db.js";
import {
  calculatePricingBreakdown,
  isStepAligned,
  roundNumber,
  toPositiveNumber,
} from "../product/pricing.utils.js";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
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
        },
      },
      pricingOption: {
        include: {
          offers: {
            orderBy: [{ minQuantity: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  },
};

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

const validateCartQuantity = (pricingOption, quantity) => {
  const parsedQuantity = roundNumber(
    toPositiveNumber(quantity, "Quantity"),
  );

  if (parsedQuantity < Number(pricingOption.minQuantity)) {
    throw new Error(
      `Minimum quantity for ${pricingOption.label} is ${Number(pricingOption.minQuantity)}`,
    );
  }

  if (
    pricingOption.maxQuantity !== null &&
    pricingOption.maxQuantity !== undefined &&
    parsedQuantity > Number(pricingOption.maxQuantity)
  ) {
    throw new Error(
      `Maximum quantity for ${pricingOption.label} is ${Number(pricingOption.maxQuantity)}`,
    );
  }

  if (
    !isStepAligned(
      parsedQuantity,
      Number(pricingOption.quantityStep),
      Number(pricingOption.minQuantity),
    )
  ) {
    throw new Error(
      `Quantity must increase in steps of ${Number(pricingOption.quantityStep)} ${pricingOption.unit}`,
    );
  }

  return parsedQuantity;
};

const assertStockAvailable = async (tx, productId, requiredInventory) => {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      stock: true,
      inventoryUnit: true,
    },
  });

  if (!product) {
    throw new Error("This product is no longer available.");
  }

  if (Number(product.stock) + 0.000001 < requiredInventory) {
    throw new Error(
      `Only ${Number(product.stock)} ${product.inventoryUnit} left for ${product.name}`,
    );
  }
};

const serializeCart = (cart) => {
  const items = cart.items.map((item) => {
    const quantity = Number(item.quantity);
    const pricing = calculatePricingBreakdown(item.pricingOption, quantity);

    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      pricingOptionId: item.pricingOptionId,
      quantity,
      pricing: pricing,
      product: {
        ...item.product,
        stock: Number(item.product.stock),
        maxStock: Number(item.product.maxStock),
        pricingOptions: item.product.pricingOptions.map((option) => ({
          id: option.id,
          label: option.label,
          unit: option.unit,
          price: Number(option.price),
          quantityStep: Number(option.quantityStep),
          minQuantity: Number(option.minQuantity),
          maxQuantity:
            option.maxQuantity === null ? null : Number(option.maxQuantity),
          inventoryFactor: Number(option.inventoryFactor),
          sortOrder: option.sortOrder,
          isDefault: option.isDefault,
          offers: option.offers.map((offer) => ({
            id: offer.id,
            minQuantity: Number(offer.minQuantity),
            discountType: offer.discountType,
            discountValue: Number(offer.discountValue),
            isActive: offer.isActive,
            startsAt: offer.startsAt,
            endsAt: offer.endsAt,
          })),
        })),
      },
      pricingOption: {
        id: item.pricingOption.id,
        label: item.pricingOption.label,
        unit: item.pricingOption.unit,
        price: Number(item.pricingOption.price),
        quantityStep: Number(item.pricingOption.quantityStep),
        minQuantity: Number(item.pricingOption.minQuantity),
        maxQuantity:
          item.pricingOption.maxQuantity === null
            ? null
            : Number(item.pricingOption.maxQuantity),
        inventoryFactor: Number(item.pricingOption.inventoryFactor),
        isDefault: item.pricingOption.isDefault,
      },
    };
  });

  return {
    ...cart,
    items,
    subtotal: roundNumber(
      items.reduce((sum, item) => sum + item.pricing.subtotal, 0),
      2,
    ),
    discount: roundNumber(
      items.reduce((sum, item) => sum + item.pricing.discount, 0),
      2,
    ),
    total: roundNumber(
      items.reduce((sum, item) => sum + item.pricing.total, 0),
      2,
    ),
  };
};

const fetchPricingOption = async (pricingOptionId) => {
  const pricingOption = await prisma.productPricingOption.findUnique({
    where: { id: pricingOptionId },
    include: {
      offers: {
        orderBy: [{ minQuantity: "asc" }, { createdAt: "asc" }],
      },
      product: {
        select: {
          id: true,
          name: true,
          stock: true,
          inventoryUnit: true,
        },
      },
    },
  });

  if (!pricingOption) {
    throw new Error("Selected pricing option is no longer available.");
  }

  return pricingOption;
};

export const addToCart = async (userId, pricingOptionId, quantity) => {
  const pricingOption = await fetchPricingOption(pricingOptionId);
  const parsedQuantity = validateCartQuantity(pricingOption, quantity);
  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_pricingOptionId: {
        cartId: cart.id,
        pricingOptionId,
      },
    },
  });

  const nextQuantity = roundNumber(
    parsedQuantity + Number(existingItem?.quantity ?? 0),
  );
  validateCartQuantity(pricingOption, nextQuantity);
  const requiredInventory = roundNumber(
    nextQuantity * Number(pricingOption.inventoryFactor),
  );

  return prisma.$transaction(async (tx) => {
    await assertStockAvailable(tx, pricingOption.productId, requiredInventory);

    if (existingItem) {
      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId: pricingOption.productId,
          pricingOptionId,
          quantity: parsedQuantity,
        },
      });
    }

    const updatedCart = await tx.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });

    return serializeCart(updatedCart);
  });
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return serializeCart(cart);
};

export const updateCartItem = async (userId, cartItemId, quantity) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      pricingOption: {
        include: {
          offers: {
            orderBy: [{ minQuantity: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!existingItem || existingItem.cartId !== cart.id) {
    throw new Error("Cart item not found");
  }

  const parsedQuantity = validateCartQuantity(existingItem.pricingOption, quantity);
  const requiredInventory = roundNumber(
    parsedQuantity * Number(existingItem.pricingOption.inventoryFactor),
  );

  return prisma.$transaction(async (tx) => {
    await assertStockAvailable(tx, existingItem.productId, requiredInventory);
    await tx.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: parsedQuantity },
    });

    const updatedCart = await tx.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });

    return serializeCart(updatedCart);
  });
};

export const removeFromCart = async (userId, cartItemId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw new Error("Cart not found");
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: cartInclude,
  });

  return serializeCart(updatedCart);
};
