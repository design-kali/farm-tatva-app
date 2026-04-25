const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1741515044901-58696421d24a?w=400&q=80",
  "https://images.unsplash.com/flagged/photo-1570197275784-ad9f674f9231?w=400&q=80",
  "https://images.unsplash.com/photo-1768776847082-9ddb43ec49ea?w=400&q=80",
  "https://images.unsplash.com/photo-1741515043161-e97d05e5cfcc?w=400&q=80",
];

const PRODUCT_IMAGES = [
  "https://images.unsplash.com/flagged/photo-1570197275784-ad9f674f9231?w=600&q=80",
  "https://images.unsplash.com/photo-1741515044901-58696421d24a?w=600&q=80",
  "https://images.unsplash.com/photo-1657288089316-c0350003ca49?w=600&q=80",
  "https://images.unsplash.com/photo-1768776847082-9ddb43ec49ea?w=600&q=80",
  "https://images.unsplash.com/photo-1722553547284-4315a34b3b82?w=600&q=80",
  "https://images.unsplash.com/photo-1741515043161-e97d05e5cfcc?w=600&q=80",
  "https://images.unsplash.com/photo-1683511997653-6be0fc990ec9?w=600&q=80",
  "https://images.unsplash.com/photo-1751200270667-cb13feeac24c?w=600&q=80",
];

const FARMER_NAMES = [
  "Rajesh Kumar",
  "Priya Sharma",
  "Arjun Patel",
  "Meera Devi",
];

export interface ApiUser {
  id: string;
  name: string;
  email: string | null;
  mobileNumber?: string | null;
  userId?: string | null;
  role: string;
  createdAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface ApiProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  createdAt: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  unit?: string;
  stock: number;
  maxStock: number;
  inventoryUnit?: string;
  categoryId: string;
  category?: ApiCategory;
  images?: ApiProductImage[];
  pricingOptions?: ApiPricingOption[];
  defaultPricingOption?: ApiPricingOption | null;
}

export interface ApiCartItem {
  id: string;
  quantity: number;
  productId: string;
  pricingOptionId: string;
  pricingOption: ApiPricingOption;
  pricing: ApiPricingBreakdown;
  product: ApiProduct;
}

export interface ApiCart {
  id: string;
  userId: string;
  items: ApiCartItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
  createdAt: string;
}

export interface ApiDeliveryArea {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ApiAddress {
  id: string;
  userId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string | null;
  addressLine: string;
  deliveryAreaId?: string | null;
  deliveryArea?: ApiDeliveryArea | null;
  createdAt: string;
}

export interface CreateAddressPayload {
  deliveryAreaId: string;
  addressLine: string;
  name?: string;
  phone?: string;
}

export interface ApiOrderItem {
  id: string;
  quantity: number;
  unit: string;
  optionLabel: string;
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  product: ApiProduct;
}

export interface ApiOrder {
  id: string;
  userId: string;
  user?: ApiUser;
  addressId?: string | null;
  address?: ApiAddress | null;
  status: string;
  subtotal?: number;
  discount?: number;
  total: number;
  items?: ApiOrderItem[];
  createdAt: string;
}

export interface ApiOfferRule {
  id: string;
  minQuantity: number;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface ApiPricingOption {
  id: string;
  label: string;
  unit: string;
  price: number;
  quantityStep: number;
  minQuantity: number;
  maxQuantity?: number | null;
  inventoryFactor: number;
  sortOrder: number;
  isDefault: boolean;
  offers: ApiOfferRule[];
}

export interface ApiPricingBreakdown {
  subtotal: number;
  discount: number;
  total: number;
  appliedOffer?: {
    id?: string;
    minQuantity: number;
    discountType: "PERCENTAGE" | "FLAT";
    discountValue: number;
  } | null;
}

export interface ApiOrderStatusMeta {
  value: string;
  label: string;
  color: string;
}

export interface ApiOrderMeta {
  orderStatuses: ApiOrderStatusMeta[];
  validOrderTransitions: Record<string, string[]>;
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

export interface ProductCardModel {
  id: string;
  name: string;
  images: string[];
  stockLeafCount: number;
  stockStatusLabel: string;
  farmer: string;
  deliveryTime: string;
  description: string;
  stock: number;
  maxStock: number;
  inventoryUnit: string;
  categoryName: string;
  pricingOptions: ApiPricingOption[];
  defaultPricingOption: ApiPricingOption;
}

export interface CategoryCardModel {
  id: string;
  name: string;
  image: string;
  count: string;
}

export interface CartItemModel {
  id: string;
  productId: string;
  pricingOptionId: string;
  name: string;
  optionLabel: string;
  unit: string;
  quantityStep: number;
  image: string;
  quantity: number;
  farmer: string;
  stock: number;
  maxStock: number;
  categoryName: string;
  pricing: ApiPricingBreakdown;
}

const slugToNumber = (value: string) => {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

const pickImage = (seed: string, images: string[]) => {
  return images[slugToNumber(seed) % images.length];
};

export const formatQuantity = (value: number) => {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, "");
};

export const calculatePricingBreakdown = (
  pricingOption: ApiPricingOption,
  quantity: number,
): ApiPricingBreakdown => {
  const subtotal = Number((pricingOption.price * quantity).toFixed(2));
  const applicableOffers = pricingOption.offers.filter((offer) => {
    if (!offer.isActive || quantity < offer.minQuantity) {
      return false;
    }

    const now = Date.now();
    if (offer.startsAt && new Date(offer.startsAt).getTime() > now) {
      return false;
    }
    if (offer.endsAt && new Date(offer.endsAt).getTime() < now) {
      return false;
    }

    return true;
  });

  const appliedOffer =
    applicableOffers.length === 0
      ? null
      : applicableOffers.reduce((bestOffer, currentOffer) => {
          const bestDiscount =
            !bestOffer
              ? 0
              : bestOffer.discountType === "FLAT"
                ? Math.min(subtotal, quantity * bestOffer.discountValue)
                : (subtotal * bestOffer.discountValue) / 100;
          const currentDiscount =
            currentOffer.discountType === "FLAT"
              ? Math.min(subtotal, quantity * currentOffer.discountValue)
              : (subtotal * currentOffer.discountValue) / 100;

          if (!bestOffer || currentDiscount > bestDiscount) {
            return currentOffer;
          }

          return bestOffer;
        }, null as ApiOfferRule | null);

  const discount = appliedOffer
    ? Number(
        (
          appliedOffer.discountType === "FLAT"
            ? Math.min(subtotal, quantity * appliedOffer.discountValue)
            : (subtotal * appliedOffer.discountValue) / 100
        ).toFixed(2),
      )
    : 0;

  return {
    subtotal,
    discount,
    total: Number((subtotal - discount).toFixed(2)),
    appliedOffer: appliedOffer
      ? {
          id: appliedOffer.id,
          minQuantity: appliedOffer.minQuantity,
          discountType: appliedOffer.discountType,
          discountValue: appliedOffer.discountValue,
        }
      : null,
  };
};

const toErrorMessage = (payload: unknown) => {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return "Something went wrong. Please try again.";
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(toErrorMessage(payload));
  }

  return payload as T;
}

export const farmTatvaApi = {
  getProducts: () => request<ApiProduct[]>("/products"),
  getProduct: (id: string) => request<ApiProduct>(`/products/${id}`),
  getCategories: () => request<ApiCategory[]>("/categories"),
  getDeliveryAreas: () => request<ApiDeliveryArea[]>("/delivery-areas"),
  getUsers: (token: string) => request<ApiUser[]>("/users", {}, token),
  getOrders: (token: string) => request<ApiOrder[]>("/orders", {}, token),
  getOrderMeta: (token: string) =>
    request<ApiOrderMeta>("/orders/meta", {}, token),
  register: (payload: { name: string; mobileNumber: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: {
    email?: string;
    mobileNumber?: string;
    password: string;
  }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getProfile: (token: string) => request<ApiUser>("/auth/profile", {}, token),
  getCart: (token: string) => request<ApiCart>("/cart", {}, token),
  getAddresses: (token: string, deliveryAreaId?: string) =>
    request<ApiAddress[]>(
      `/addresses${
        deliveryAreaId
          ? `?deliveryAreaId=${encodeURIComponent(deliveryAreaId)}`
          : ""
      }`,
      {},
      token,
    ),
  createAddress: (token: string, payload: CreateAddressPayload) =>
    request<ApiAddress>(
      "/addresses",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),
  addToCart: (token: string, pricingOptionId: string, quantity: number) =>
    request<ApiCart>(
      "/cart",
      {
        method: "POST",
        body: JSON.stringify({ pricingOptionId, quantity }),
      },
      token,
    ),
  updateCartItem: (token: string, cartItemId: string, quantity: number) =>
    request<ApiCart>(
      "/cart",
      {
        method: "PUT",
        body: JSON.stringify({ cartItemId, quantity }),
      },
      token,
    ),
  removeCartItem: (token: string, cartItemId: string) =>
    request<ApiCart>(`/cart/${cartItemId}`, { method: "DELETE" }, token),
  placeOrder: (token: string, addressId: string) =>
    request<ApiOrder>(
      "/orders",
      {
        method: "POST",
        body: JSON.stringify({ addressId }),
      },
      token,
    ),
  // Admin CRUD: Products
  createProduct: (
    token: string,
    payload: Record<string, unknown>,
  ) =>
    request<ApiProduct>(
      "/products",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),
  updateProduct: (token: string, id: string, payload: Record<string, unknown>) =>
    request<ApiProduct>(
      `/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token,
    ),
  deleteProduct: (token: string, id: string) =>
    request<{ success: boolean }>(
      `/products/${id}`,
      { method: "DELETE" },
      token,
    ),
  // Admin CRUD: Categories
  createCategory: (
    token: string,
    payload: Omit<ApiCategory, "id" | "createdAt">,
  ) =>
    request<ApiCategory>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),
  updateCategory: (token: string, id: string, payload: Partial<ApiCategory>) =>
    request<ApiCategory>(
      `/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token,
    ),
  deleteCategory: (token: string, id: string) =>
    request<{ success: boolean }>(
      `/categories/${id}`,
      { method: "DELETE" },
      token,
    ),
  // Admin CRUD: Delivery Areas
  createDeliveryArea: (
    token: string,
    payload: Omit<ApiDeliveryArea, "id" | "createdAt">,
  ) =>
    request<ApiDeliveryArea>(
      "/delivery-areas",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),
  updateDeliveryArea: (
    token: string,
    id: string,
    payload: Partial<ApiDeliveryArea>,
  ) =>
    request<ApiDeliveryArea>(
      `/delivery-areas/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token,
    ),
  deleteDeliveryArea: (token: string, id: string) =>
    request<{ success: boolean }>(
      `/delivery-areas/${id}`,
      { method: "DELETE" },
      token,
    ),
  // Admin CRUD: Users
  updateUser: (token: string, id: string, payload: Partial<ApiUser>) =>
    request<ApiUser>(
      `/users/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token,
    ),
  deleteUser: (token: string, id: string) =>
    request<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }, token),
  // Admin: Update Order Status
  updateOrderStatus: (token: string, orderId: string, status: string) =>
    request<ApiOrder>(
      "/orders/status",
      {
        method: "PUT",
        body: JSON.stringify({ orderId, status }),
      },
      token,
    ),
};

export const mapProductToCard = (
  product: ApiProduct,
  index: number,
): ProductCardModel => {
  const categoryName = product.category?.name || "Fresh Produce";
  const pricingOptions =
    product.pricingOptions && product.pricingOptions.length > 0
      ? [...product.pricingOptions].sort(
          (left, right) => left.sortOrder - right.sortOrder,
        )
      : [
          {
            id: `${product.id}-default`,
            label: `Per ${product.unit || "unit"}`,
            unit: product.unit || "unit",
            price: product.price,
            quantityStep: 1,
            minQuantity: 1,
            maxQuantity: null,
            inventoryFactor: 1,
            sortOrder: 0,
            isDefault: true,
            offers: [],
          },
        ];
  const defaultPricingOption =
    product.defaultPricingOption ||
    pricingOptions.find((option) => option.isDefault) ||
    pricingOptions[0];
  const farmerName =
    FARMER_NAMES[
      slugToNumber(product.id || `${product.name}-${index}`) %
        FARMER_NAMES.length
    ];
  const maxStock = Math.max(product.maxStock || 0, product.stock || 0);
  const stockLeafCount =
    product.stock <= 0
      ? 0
      : Math.max(1, Math.ceil((product.stock / Math.max(maxStock, 1)) * 5));

  return {
    id: product.id,
    name: product.name,
    images:
      product.images?.length > 0
        ? product.images.map((img) => img.imageUrl)
        : [pickImage(product.name, PRODUCT_IMAGES)],
    stockLeafCount,
    stockStatusLabel:
      product.stock > 0
        ? `${formatQuantity(product.stock)} ${product.inventoryUnit || defaultPricingOption.unit} left`
        : "Sold out",
    farmer: farmerName,
    deliveryTime: product.stock > 0 ? "Tomorrow morning" : "Restocking",
    description:
      product.description ||
      `Fresh ${categoryName.toLowerCase()} from FarmTatva.`,
    stock: product.stock,
    maxStock,
    inventoryUnit: product.inventoryUnit || defaultPricingOption.unit,
    categoryName,
    pricingOptions,
    defaultPricingOption,
  };
};

export const mapCartToItems = (cart: ApiCart | null | undefined) => {
  return (cart?.items || []).map((item, index) => {
    const mappedProduct = mapProductToCard(item.product, index);

    return {
      id: item.id,
      productId: item.productId,
      pricingOptionId: item.pricingOptionId,
      name: mappedProduct.name,
      optionLabel: item.pricingOption.label,
      unit: item.pricingOption.unit,
      quantityStep: item.pricingOption.quantityStep,
      image: mappedProduct.images[0] || "",
      quantity: item.quantity,
      farmer: mappedProduct.farmer,
      stock: mappedProduct.stock,
      maxStock: mappedProduct.maxStock,
      categoryName: mappedProduct.categoryName,
      pricing: item.pricing,
    };
  });
};

export const mapCategories = (
  categories: ApiCategory[],
  products: ApiProduct[],
): CategoryCardModel[] => {
  const productCountByCategory = new Map<string, number>();

  products.forEach((product) => {
    productCountByCategory.set(
      product.categoryId,
      (productCountByCategory.get(product.categoryId) || 0) + 1,
    );
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    image: pickImage(category.name, CATEGORY_IMAGES),
    count: `${productCountByCategory.get(category.id) || 0} items`,
  }));
};

export const formatDeliveryAreaAddress = (
  deliveryArea: ApiDeliveryArea | null | undefined,
) => {
  if (!deliveryArea) {
    return "";
  }

  return [deliveryArea.street, deliveryArea.city, deliveryArea.state]
    .filter(Boolean)
    .join(", ")
    .concat(deliveryArea.zipCode ? ` - ${deliveryArea.zipCode}` : "");
};
