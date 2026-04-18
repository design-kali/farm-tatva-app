import prisma from "../../config/db.js";

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue || null;
};

export const createAddress = async (userId, data) => {
  const deliveryAreaId = normalizeOptionalString(data.deliveryAreaId);
  const addressLine = normalizeOptionalString(data.addressLine);

  if (!deliveryAreaId) {
    throw new Error("Select a delivery area before saving an address.");
  }

  if (!addressLine) {
    throw new Error("Address line is required.");
  }

  const deliveryArea = await prisma.deliveryArea.findFirst({
    where: {
      id: deliveryAreaId,
      isActive: true,
    },
  });

  if (!deliveryArea) {
    throw new Error("Selected delivery area is not available.");
  }

  return prisma.address.create({
    data: {
      userId,
      deliveryAreaId: deliveryArea.id,
      name: normalizeOptionalString(data.name) || "Home",
      phone: normalizeOptionalString(data.phone),
      addressLine,
      street: deliveryArea.street,
      city: deliveryArea.city,
      state: deliveryArea.state,
      zipCode: deliveryArea.zipCode,
    },
    include: {
      deliveryArea: true,
    },
  });
};

export const getUserAddresses = async (userId, deliveryAreaId) => {
  return prisma.address.findMany({
    where: {
      userId,
      ...(deliveryAreaId ? { deliveryAreaId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      deliveryArea: true,
    },
  });
};

export const deleteAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  return prisma.address.delete({
    where: {
      id: addressId,
    },
  });
};
