import { DiscountType } from "@prisma/client";

const DECIMAL_PRECISION = 3;
const MONEY_PRECISION = 2;

export const roundNumber = (value, precision = DECIMAL_PRECISION) => {
  const factor = 10 ** precision;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

export const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error("Invalid numeric value");
  }

  return parsedValue;
};

export const toPositiveNumber = (value, fieldName) => {
  const parsedValue = toNumber(value);

  if (parsedValue <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }

  return parsedValue;
};

export const toNonNegativeNumber = (value, fieldName, fallback = 0) => {
  const parsedValue = toNumber(value, fallback);

  if (parsedValue < 0) {
    throw new Error(`${fieldName} must be 0 or more`);
  }

  return parsedValue;
};

export const normalizeOfferRuleInput = (offer, index) => {
  const minQuantity = roundNumber(
    toPositiveNumber(offer.minQuantity, `Offer ${index + 1} minimum quantity`),
  );
  const discountType =
    offer.discountType === DiscountType.FLAT ? DiscountType.FLAT : DiscountType.PERCENTAGE;
  const discountValue = roundNumber(
    toPositiveNumber(offer.discountValue, `Offer ${index + 1} discount value`),
    MONEY_PRECISION,
  );

  if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
    throw new Error(`Offer ${index + 1} percentage discount cannot exceed 100`);
  }

  const startsAt = offer.startsAt ? new Date(offer.startsAt) : null;
  const endsAt = offer.endsAt ? new Date(offer.endsAt) : null;

  if (startsAt && Number.isNaN(startsAt.getTime())) {
    throw new Error(`Offer ${index + 1} start date is invalid`);
  }

  if (endsAt && Number.isNaN(endsAt.getTime())) {
    throw new Error(`Offer ${index + 1} end date is invalid`);
  }

  if (startsAt && endsAt && startsAt > endsAt) {
    throw new Error(`Offer ${index + 1} end date must be after the start date`);
  }

  return {
    minQuantity,
    discountType,
    discountValue,
    isActive: offer.isActive !== false,
    startsAt,
    endsAt,
  };
};

export const normalizePricingOptionInput = (option, index) => {
  const label = String(option.label || "").trim();
  const unit = String(option.unit || "").trim();

  if (!label) {
    throw new Error(`Pricing option ${index + 1} label is required`);
  }

  if (!unit) {
    throw new Error(`Pricing option ${index + 1} unit is required`);
  }

  const price = roundNumber(
    toPositiveNumber(option.price, `Pricing option ${index + 1} price`),
    MONEY_PRECISION,
  );
  const quantityStep = roundNumber(
    toPositiveNumber(option.quantityStep, `Pricing option ${index + 1} step`),
  );
  const minQuantity = roundNumber(
    toPositiveNumber(option.minQuantity ?? option.quantityStep, `Pricing option ${index + 1} minimum quantity`),
  );
  const maxQuantity =
    option.maxQuantity === undefined || option.maxQuantity === null || option.maxQuantity === ""
      ? null
      : roundNumber(
          toPositiveNumber(option.maxQuantity, `Pricing option ${index + 1} maximum quantity`),
        );
  const inventoryFactor = roundNumber(
    toPositiveNumber(
      option.inventoryFactor,
      `Pricing option ${index + 1} inventory factor`,
    ),
  );

  if (minQuantity < quantityStep) {
    throw new Error(
      `Pricing option ${index + 1} minimum quantity must be at least one step`,
    );
  }

  if (maxQuantity !== null && maxQuantity < minQuantity) {
    throw new Error(
      `Pricing option ${index + 1} maximum quantity must be greater than the minimum quantity`,
    );
  }

  return {
    label,
    unit,
    price,
    quantityStep,
    minQuantity,
    maxQuantity,
    inventoryFactor,
    sortOrder: Number.isFinite(Number(option.sortOrder))
      ? Number(option.sortOrder)
      : index,
    isDefault: Boolean(option.isDefault),
    offers: Array.isArray(option.offers)
      ? option.offers.map(normalizeOfferRuleInput)
      : [],
  };
};

export const normalizePricingOptionsInput = (options, fallbackPrice, fallbackUnit) => {
  const rawOptions =
    Array.isArray(options) && options.length > 0
      ? options
      : fallbackPrice !== undefined && fallbackPrice !== null
        ? [
            {
              label: `Per ${fallbackUnit || "unit"}`,
              unit: fallbackUnit || "unit",
              price: fallbackPrice,
              quantityStep: 1,
              minQuantity: 1,
              inventoryFactor: 1,
              isDefault: true,
            },
          ]
        : [];

  if (rawOptions.length === 0) {
    throw new Error("At least one pricing option is required");
  }

  const normalizedOptions = rawOptions.map(normalizePricingOptionInput);
  const hasDefault = normalizedOptions.some((option) => option.isDefault);

  return normalizedOptions.map((option, index) => ({
    ...option,
    isDefault: hasDefault ? option.isDefault : index === 0,
  }));
};

export const isStepAligned = (quantity, step, minQuantity = step) => {
  const normalized = roundNumber(quantity - minQuantity);
  const normalizedStep = roundNumber(step);

  if (normalizedStep <= 0) {
    return false;
  }

  const quotient = normalized / normalizedStep;
  return Math.abs(quotient - Math.round(quotient)) < 0.000001;
};

export const getActiveOfferRules = (offers, now = new Date()) => {
  return (offers || []).filter((offer) => {
    if (offer.isActive === false) {
      return false;
    }

    if (offer.startsAt && new Date(offer.startsAt) > now) {
      return false;
    }

    if (offer.endsAt && new Date(offer.endsAt) < now) {
      return false;
    }

    return true;
  });
};

export const calculateOfferDiscount = (subtotal, quantity, offer) => {
  if (!offer) {
    return 0;
  }

  if (offer.discountType === DiscountType.FLAT) {
    return roundNumber(Math.min(subtotal, quantity * Number(offer.discountValue)), MONEY_PRECISION);
  }

  return roundNumber(
    Math.min(subtotal, (subtotal * Number(offer.discountValue)) / 100),
    MONEY_PRECISION,
  );
};

export const resolveBestOffer = (pricingOption, quantity, now = new Date()) => {
  const activeOffers = getActiveOfferRules(pricingOption.offers, now).filter(
    (offer) => Number(offer.minQuantity) <= quantity,
  );

  if (activeOffers.length === 0) {
    return null;
  }

  const subtotal = roundNumber(quantity * Number(pricingOption.price), MONEY_PRECISION);

  return activeOffers.reduce((bestOffer, currentOffer) => {
    const currentDiscount = calculateOfferDiscount(subtotal, quantity, currentOffer);

    if (!bestOffer) {
      return { ...currentOffer, appliedDiscount: currentDiscount };
    }

    if (currentDiscount > bestOffer.appliedDiscount) {
      return { ...currentOffer, appliedDiscount: currentDiscount };
    }

    if (
      currentDiscount === bestOffer.appliedDiscount &&
      Number(currentOffer.minQuantity) > Number(bestOffer.minQuantity)
    ) {
      return { ...currentOffer, appliedDiscount: currentDiscount };
    }

    return bestOffer;
  }, null);
};

export const calculatePricingBreakdown = (pricingOption, quantity, now = new Date()) => {
  const subtotal = roundNumber(quantity * Number(pricingOption.price), MONEY_PRECISION);
  const appliedOffer = resolveBestOffer(pricingOption, quantity, now);
  const discount = appliedOffer ? appliedOffer.appliedDiscount : 0;
  const total = roundNumber(subtotal - discount, MONEY_PRECISION);

  return {
    subtotal,
    discount,
    total,
    appliedOffer: appliedOffer
      ? {
          id: appliedOffer.id,
          minQuantity: Number(appliedOffer.minQuantity),
          discountType: appliedOffer.discountType,
          discountValue: Number(appliedOffer.discountValue),
        }
      : null,
  };
};

export const serializeOfferRule = (offer) => ({
  id: offer.id,
  minQuantity: Number(offer.minQuantity),
  discountType: offer.discountType,
  discountValue: Number(offer.discountValue),
  isActive: offer.isActive,
  startsAt: offer.startsAt,
  endsAt: offer.endsAt,
});

export const serializePricingOption = (option) => ({
  id: option.id,
  label: option.label,
  unit: option.unit,
  price: Number(option.price),
  quantityStep: Number(option.quantityStep),
  minQuantity: Number(option.minQuantity),
  maxQuantity: option.maxQuantity === null ? null : Number(option.maxQuantity),
  inventoryFactor: Number(option.inventoryFactor),
  sortOrder: option.sortOrder,
  isDefault: option.isDefault,
  offers: (option.offers || []).map(serializeOfferRule),
});

export const serializeProduct = (product) => {
  const pricingOptions = (product.pricingOptions || [])
    .map(serializePricingOption)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const defaultOption =
    pricingOptions.find((option) => option.isDefault) || pricingOptions[0] || null;

  return {
    ...product,
    stock: Number(product.stock ?? 0),
    maxStock: Number(product.maxStock ?? 0),
    pricingOptions,
    defaultPricingOption: defaultOption,
    price: defaultOption?.price ?? Number(product.price ?? 0),
    unit: defaultOption?.unit ?? "unit",
  };
};
