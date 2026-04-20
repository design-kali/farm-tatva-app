import {
  Search,
  ShoppingBag,
  MapPin,
  Clock,
  Leaf,
  Sprout,
  Ban,
  CalendarRange,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "./components/ProductCard";
import { CategoryCard } from "./components/CategoryCard";
import { FloatingCartBar } from "./components/FloatingCartBar";
import { CartOverlay } from "./components/CartOverlay";
import { FeatureCard } from "./components/FeatureCard";
import { LoginDialog } from "./components/LoginDialog";
import { DeliveryAreaDialog } from "./components/DeliveryAreaDialog";
import {
  farmTatvaApi,
  mapCartToItems,
  mapCategories,
  mapProductToCard,
  type ApiAddress,
  type ApiDeliveryArea,
  type ApiUser,
  type CartItemModel as CartItem,
  type CategoryCardModel,
  type CreateAddressPayload,
  type ProductCardModel,
} from "./lib/api";
import {
  clearStoredSession,
  persistSession,
  readStoredSession,
  type StoredSession,
} from "./lib/auth";

const GUEST_CART_STORAGE_KEY = "farm-tatva-guest-cart";
const DELIVERY_AREA_STORAGE_KEY = "farm-tatva-delivery-area";

const getUserDisplayName = (user: ApiUser | null | undefined) => {
  const rawName = typeof user?.name === "string" ? user.name.trim() : "";

  if (rawName) {
    return rawName;
  }

  const rawEmail = typeof user?.email === "string" ? user.email.trim() : "";

  if (rawEmail) {
    return rawEmail.split("@")[0];
  }

  return "Farmer";
};

const getUserFirstName = (user: ApiUser | null | undefined) => {
  return getUserDisplayName(user).split(" ")[0];
};

const getUserInitial = (user: ApiUser | null | undefined) => {
  return getUserDisplayName(user).charAt(0).toUpperCase();
};

const readStoredGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map((item) => ({
      ...item,
      maxStock:
        typeof item?.maxStock === "number" ? item.maxStock : item?.stock || 0,
    }));
  } catch {
    return [];
  }
};

const persistGuestCart = (cartItems: CartItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    GUEST_CART_STORAGE_KEY,
    JSON.stringify(cartItems),
  );
};

const clearStoredGuestCart = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
};

const readStoredDeliveryAreaId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(DELIVERY_AREA_STORAGE_KEY);
};

const persistDeliveryAreaId = (deliveryAreaId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DELIVERY_AREA_STORAGE_KEY, deliveryAreaId);
};

const clearStoredDeliveryAreaId = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DELIVERY_AREA_STORAGE_KEY);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

export default function App() {
  const [session, setSession] = useState<StoredSession | null>(() =>
    readStoredSession(),
  );
  const [products, setProducts] = useState<ProductCardModel[]>([]);
  const [categories, setCategories] = useState<CategoryCardModel[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    return readStoredSession()?.token ? [] : readStoredGuestCart();
  });
  const [deliveryAreas, setDeliveryAreas] = useState<ApiDeliveryArea[]>([]);
  const [selectedDeliveryAreaId, setSelectedDeliveryAreaId] = useState<
    string | null
  >(() => readStoredDeliveryAreaId());
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showCartOverlay, setShowCartOverlay] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showDeliveryAreaDialog, setShowDeliveryAreaDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [deliveryAreaError, setDeliveryAreaError] = useState<string | null>(
    null,
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isCartSubmitting, setIsCartSubmitting] = useState(false);
  const [isDeliveryAreaLoading, setIsDeliveryAreaLoading] = useState(true);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);
  const cartRequestIdRef = useRef(0);
  const addressRequestIdRef = useRef(0);

  const authToken = session?.token || null;
  const currentUser = session?.user || null;
  const currentUserFirstName = getUserFirstName(currentUser);
  const currentUserInitial = getUserInitial(currentUser);
  const selectedDeliveryArea =
    deliveryAreas.find((area) => area.id === selectedDeliveryAreaId) || null;

  const startCartRequest = () => {
    cartRequestIdRef.current += 1;
    return cartRequestIdRef.current;
  };

  const isLatestCartRequest = (requestId: number) => {
    return requestId === cartRequestIdRef.current;
  };

  const startAddressRequest = () => {
    addressRequestIdRef.current += 1;
    return addressRequestIdRef.current;
  };

  const isLatestAddressRequest = (requestId: number) => {
    return requestId === addressRequestIdRef.current;
  };

  const syncGuestCartToBackend = async (token: string) => {
    const guestCart = readStoredGuestCart();

    if (guestCart.length === 0) {
      return null;
    }

    for (const item of guestCart) {
      await farmTatvaApi.addToCart(token, item.id, item.quantity);
    }

    clearStoredGuestCart();
    return guestCart.length;
  };

  useEffect(() => {
    let isCancelled = false;

    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError(null);

      try {
        const [backendProducts, backendCategories] = await Promise.all([
          farmTatvaApi.getProducts(),
          farmTatvaApi.getCategories(),
        ]);

        if (isCancelled) {
          return;
        }

        setProducts(backendProducts.map(mapProductToCard));
        setCategories(mapCategories(backendCategories, backendProducts));
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setCatalogError(getErrorMessage(error));
      } finally {
        if (!isCancelled) {
          setCatalogLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadDeliveryAreas = async () => {
      setIsDeliveryAreaLoading(true);
      setDeliveryAreaError(null);

      try {
        const backendDeliveryAreas = await farmTatvaApi.getDeliveryAreas();

        if (isCancelled) {
          return;
        }

        setDeliveryAreas(backendDeliveryAreas);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setDeliveryAreaError(getErrorMessage(error));
      } finally {
        if (!isCancelled) {
          setIsDeliveryAreaLoading(false);
        }
      }
    };

    loadDeliveryAreas();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isDeliveryAreaLoading) {
      return;
    }

    if (deliveryAreas.length === 0) {
      clearStoredDeliveryAreaId();
      setSelectedDeliveryAreaId(null);
      setShowDeliveryAreaDialog(false);
      return;
    }

    const selectedAreaStillExists = deliveryAreas.some(
      (area) => area.id === selectedDeliveryAreaId,
    );

    if (!selectedAreaStillExists) {
      clearStoredDeliveryAreaId();
      setSelectedDeliveryAreaId(null);
      setShowDeliveryAreaDialog(true);
      return;
    }

    setShowDeliveryAreaDialog(false);
  }, [deliveryAreas, isDeliveryAreaLoading, selectedDeliveryAreaId]);

  useEffect(() => {
    let isCancelled = false;

    const hydrateSession = async () => {
      if (!authToken) {
        startCartRequest();
        setCart(readStoredGuestCart());
        return;
      }

      const requestId = startCartRequest();

      try {
        const [profile, backendCart] = await Promise.all([
          farmTatvaApi.getProfile(authToken),
          farmTatvaApi.getCart(authToken),
        ]);

        if (isCancelled || !isLatestCartRequest(requestId)) {
          return;
        }

        const nextSession = {
          token: authToken,
          user: profile,
        };

        persistSession(nextSession);
        setSession(nextSession);
        setCart(mapCartToItems(backendCart));
      } catch (error) {
        if (isCancelled || !isLatestCartRequest(requestId)) {
          return;
        }

        clearStoredSession();
        setSession(null);
        setCart(readStoredGuestCart());
        setAuthError(`${getErrorMessage(error)} Please sign in again.`);
      }
    };

    hydrateSession();

    return () => {
      isCancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    let isCancelled = false;

    const loadAddresses = async () => {
      if (!authToken || !selectedDeliveryAreaId) {
        startAddressRequest();
        setAddresses([]);
        setSelectedAddressId(null);
        setIsAddressLoading(false);
        return;
      }

      const requestId = startAddressRequest();
      setIsAddressLoading(true);

      try {
        const backendAddresses = await farmTatvaApi.getAddresses(
          authToken,
          selectedDeliveryAreaId,
        );

        if (isCancelled || !isLatestAddressRequest(requestId)) {
          return;
        }

        setAddresses(backendAddresses);
        setSelectedAddressId((current) =>
          backendAddresses.some((address) => address.id === current)
            ? current
            : null,
        );
      } catch (error) {
        if (isCancelled || !isLatestAddressRequest(requestId)) {
          return;
        }

        setAddresses([]);
        setSelectedAddressId(null);
        setCartMessage(getErrorMessage(error));
      } finally {
        if (!isCancelled) {
          setIsAddressLoading(false);
        }
      }
    };

    loadAddresses();

    return () => {
      isCancelled = true;
    };
  }, [authToken, selectedDeliveryAreaId]);

  const closeLoginDialog = () => {
    setShowLoginDialog(false);
    setAuthError(null);
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(
      selectedCategory === categoryName ? null : categoryName,
    );
  };

  const requireAuth = (message: string) => {
    setAuthError(message);
    setShowLoginDialog(true);
    return false;
  };

  const handleAuthSubmit = async (
    mode: "login" | "register",
    values: { name: string; email: string; password: string },
  ) => {
    setIsAuthSubmitting(true);
    setAuthError(null);

    try {
      const response =
        mode === "login"
          ? await farmTatvaApi.login({
              email: values.email,
              password: values.password,
            })
          : await farmTatvaApi.register(values);

      const nextSession = {
        token: response.token,
        user: response.user,
      };

      persistSession(nextSession);
      const syncedGuestCount = await syncGuestCartToBackend(response.token);
      const requestId = startCartRequest();
      const backendCart = await farmTatvaApi.getCart(response.token);

      if (!isLatestCartRequest(requestId)) {
        return;
      }

      const nextAddresses = selectedDeliveryAreaId
        ? await farmTatvaApi.getAddresses(response.token, selectedDeliveryAreaId)
        : [];

      if (!isLatestCartRequest(requestId)) {
        return;
      }

      setSession(nextSession);
      setCart(mapCartToItems(backendCart));
      setAddresses(nextAddresses);
      setSelectedAddressId(null);
      setShowLoginDialog(false);
      setCartMessage(
        syncedGuestCount
          ? `Welcome ${getUserFirstName(response.user)}. Synced ${syncedGuestCount} guest item${syncedGuestCount === 1 ? "" : "s"} to your account.`
          : `Welcome ${getUserFirstName(response.user)}. Your basket now syncs with the backend.`,
      );
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSelectDeliveryArea = (deliveryAreaId: string) => {
    const nextArea =
      deliveryAreas.find((area) => area.id === deliveryAreaId) || null;
    const isAreaChanged = deliveryAreaId !== selectedDeliveryAreaId;

    setSelectedDeliveryAreaId(deliveryAreaId);
    persistDeliveryAreaId(deliveryAreaId);
    setShowDeliveryAreaDialog(false);
    setSelectedAddressId(null);

    if (isAreaChanged && nextArea) {
      setCartMessage(
        `Delivering inside ${nextArea.name}. Choose or save an address for this society before checkout.`,
      );
    }
  };

  const openDeliveryAreaDialog = () => {
    setShowDeliveryAreaDialog(true);
  };

  const handleLogout = () => {
    startCartRequest();
    startAddressRequest();
    clearStoredSession();
    setSession(null);
    clearStoredGuestCart();
    setCart([]);
    setAddresses([]);
    setSelectedAddressId(null);
    setIsAddressLoading(false);
    setIsAddressSubmitting(false);
    setIsCheckoutSubmitting(false);
    setShowLoginDialog(false);
    setCartMessage("You have been logged out.");
  };

  const handleAddAddress = async (payload: CreateAddressPayload) => {
    if (!authToken) {
      throw new Error("Sign in to save an address.");
    }

    if (!selectedDeliveryArea) {
      throw new Error("Select your society before saving an address.");
    }

    setIsAddressSubmitting(true);
    setCartMessage(null);

    try {
      const address = await farmTatvaApi.createAddress(authToken, payload);

      setAddresses((current) => [
        address,
        ...current.filter((currentAddress) => currentAddress.id !== address.id),
      ]);
      setSelectedAddressId(address.id);
      setCartMessage(
        `${address.name} saved for ${selectedDeliveryArea.name}. Checkout is ready when you are.`,
      );
    } catch (error) {
      const message = getErrorMessage(error);
      setCartMessage(message);
      throw new Error(message);
    } finally {
      setIsAddressSubmitting(false);
    }
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.find((cartItem) => cartItem.id === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = async (product: ProductCardModel) => {
    if (!authToken) {
      const nextCart = (() => {
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
          return cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }

        return [
          ...cart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            image: product.images[0] || "",
            quantity: 1,
            farmer: product.farmer,
            stock: product.stock,
            maxStock: product.maxStock,
            categoryName: product.categoryName,
          },
        ];
      })();

      setCart(nextCart);
      persistGuestCart(nextCart);
      setCartMessage(
        "Basket saved on this device. Sign in later and we will sync it to your account.",
      );
      return;
    }

    if (product.stock > 0 && getItemQuantity(product.id) >= product.stock) {
      setCartMessage(
        "You have already added all available stock for this item.",
      );
      return;
    }

    setIsCartSubmitting(true);
    setCartMessage(null);
    const requestId = startCartRequest();

    try {
      const backendCart = await farmTatvaApi.addToCart(
        authToken,
        product.id,
        1,
      );

      if (!isLatestCartRequest(requestId)) {
        return;
      }

      setCart(mapCartToItems(backendCart));
    } catch (error) {
      if (!isLatestCartRequest(requestId)) {
        return;
      }

      setCartMessage(getErrorMessage(error));
    } finally {
      setIsCartSubmitting(false);
    }
  };

  const updateQuantity = async (productId: string, change: number) => {
    if (!authToken) {
      const existingItem = cart.find((item) => item.id === productId);

      if (!existingItem) {
        return;
      }

      if (change > 0 && existingItem.quantity >= existingItem.stock) {
        setCartMessage("You have reached the available stock for this item.");
        return;
      }

      const nextCart = cart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0);

      setCart(nextCart);
      persistGuestCart(nextCart);
      return;
    }

    const existingItem = cart.find((item) => item.id === productId);

    if (!existingItem) {
      return;
    }

    const nextQuantity = existingItem.quantity + change;

    if (change > 0 && existingItem.quantity >= existingItem.stock) {
      setCartMessage("You have reached the available stock for this item.");
      return;
    }

    setIsCartSubmitting(true);
    setCartMessage(null);
    const requestId = startCartRequest();

    try {
      const backendCart =
        nextQuantity <= 0
          ? await farmTatvaApi.removeCartItem(authToken, productId)
          : await farmTatvaApi.updateCartItem(
              authToken,
              productId,
              nextQuantity,
            );

      if (!isLatestCartRequest(requestId)) {
        return;
      }

      setCart(mapCartToItems(backendCart));
    } catch (error) {
      if (!isLatestCartRequest(requestId)) {
        return;
      }

      setCartMessage(getErrorMessage(error));
    } finally {
      setIsCartSubmitting(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!authToken) {
      const nextCart = cart.filter((item) => item.id !== productId);

      setCart(nextCart);
      persistGuestCart(nextCart);
      return;
    }

    setIsCartSubmitting(true);
    setCartMessage(null);
    const requestId = startCartRequest();

    try {
      const backendCart = await farmTatvaApi.removeCartItem(
        authToken,
        productId,
      );

      if (!isLatestCartRequest(requestId)) {
        return;
      }

      setCart(mapCartToItems(backendCart));
    } catch (error) {
      if (!isLatestCartRequest(requestId)) {
        return;
      }

      setCartMessage(getErrorMessage(error));
    } finally {
      setIsCartSubmitting(false);
    }
  };

  const handleCheckout = () => {
    if (!authToken) {
      requireAuth("Sign in to continue to checkout.");
      return;
    }

    if (!selectedDeliveryArea) {
      setCartMessage("Select your delivery society to continue.");
      setShowDeliveryAreaDialog(true);
      return;
    }

    if (!selectedAddressId) {
      setCartMessage("Select a delivery address to continue.");
      return;
    }

    void (async () => {
      setIsCheckoutSubmitting(true);
      setCartMessage(null);
      const requestId = startCartRequest();

      try {
        const order = await farmTatvaApi.placeOrder(authToken, selectedAddressId);
        const backendCart = await farmTatvaApi.getCart(authToken);

        if (!isLatestCartRequest(requestId)) {
          return;
        }

        setCart(mapCartToItems(backendCart));
        setSelectedAddressId(null);
        setCartMessage(
          `Order placed successfully. Order ${order.id.slice(0, 8)} is ${order.status.toLowerCase()}.`,
        );
      } catch (error) {
        if (!isLatestCartRequest(requestId)) {
          return;
        }

        setCartMessage(getErrorMessage(error));
      } finally {
        setIsCheckoutSubmitting(false);
      }
    })();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const lowestPrice = products.length
    ? Math.min(...products.map((product) => product.price))
    : 35;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.categoryName === selectedCategory;
    const matchesSearch =
      !normalizedSearch ||
      [product.name, product.categoryName, product.description, product.farmer]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F4E1]">
      <header className="sticky top-0 z-50 bg-white border-b border-[#1B4332]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Leaf className="w-8 h-8 text-[#1B4332]" />
              <h1 className="text-2xl md:text-3xl font-serif text-[#1B4332]">
                FarmTatva
              </h1>
            </motion.div>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <button
                type="button"
                onClick={openDeliveryAreaDialog}
                className="flex items-center gap-2 text-left text-[#1B4332] transition-opacity hover:opacity-80"
              >
                <MapPin className="w-4 h-4" />
                <span>
                  Deliver to:{" "}
                  <strong>
                    {selectedDeliveryArea
                      ? `${selectedDeliveryArea.name} ${selectedDeliveryArea.zipCode}`
                      : "Select Society"}
                  </strong>
                </span>
              </button>
              <div className="flex items-center gap-2 text-[#1B4332]">
                <Clock className="w-4 h-4" />
                <span>Delivered Fresh Every Morning</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm text-[#1B4332]">
                  {currentUser
                    ? `Hi, ${currentUserFirstName}`
                    : "Browse freely"}
                </span>
                <span className="text-xs text-[#1B4332]/60">
                  {currentUser
                    ? "Your basket is synced"
                    : "Sign in to save your cart"}
                </span>
              </div>

              {currentUser?.role === "ADMIN" && (
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
                >
                  Admin
                </Link>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLoginDialog(true)}
                className="w-10 h-10 bg-[#F8F4E1] text-[#1B4332] rounded-full flex items-center justify-center border-2 border-[#1B4332]/10 hover:border-[#1B4332]/30 transition-colors"
              >
                {currentUser ? (
                  <span>{currentUserInitial}</span>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </motion.button>

              <motion.div ref={cartIconRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCartOverlay(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white rounded-full"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="hidden sm:inline">Cart</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-white text-[#1B4332] rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      {totalItems}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-4"
          >
            <div className="mb-3 flex justify-center md:hidden">
              <button
                type="button"
                onClick={openDeliveryAreaDialog}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#1B4332]/10 bg-[#F8F4E1] px-4 py-2 text-sm text-[#1B4332]"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {selectedDeliveryArea
                    ? selectedDeliveryArea.name
                    : "Select your society"}
                </span>
              </button>
            </div>

            {deliveryAreaError && (
              <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deliveryAreaError}
              </div>
            )}

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B4332]/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search fresh produce, categories, or your favorite farmer..."
                className="w-full pl-14 pr-6 py-4 bg-[#F8F4E1] border-2 border-[#1B4332]/20 rounded-[32px] text-[#1B4332] placeholder:text-[#1B4332]/50 focus:outline-none focus:border-[#1B4332] transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-[#1B4332]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white z-10"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 font-serif leading-tight"
              >
                The Farm's Best,
                <br />
                <span className="text-[#F8F4E1]">Hand-Picked Today.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed"
              >
                Your storefront is now powered by live backend products,
                categories, authentication, and cart sync.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  document
                    .getElementById("products-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-white text-[#1B4332] rounded-full inline-flex items-center gap-2 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <span className="text-lg">Start Your Weekly Stock-Up</span>
                <Leaf className="w-5 h-5" />
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 md:mt-12 flex flex-wrap gap-6 md:gap-8 text-white/80 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <span>Fresh from Trusted Farmers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span>Delivered Fresh Every Morning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-lg">₹</span>
                  </div>
                  <span>Wholesale Prices</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=1200&q=80"
                  alt="Fresh vegetables in rustic wooden crate"
                  className="w-full h-full object-cover aspect-[4/3]"
                />
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                  <p className="text-sm text-[#1B4332]/60 mb-1">
                    Starting from
                  </p>
                  <p className="text-2xl font-serif text-[#1B4332]">
                    ₹{lowestPrice}/kg
                  </p>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-[#F8F4E1] rounded-full opacity-20 blur-2xl"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#F8F4E1] rounded-full opacity-20 blur-2xl"
              />
            </motion.div>
          </div>
        </div>

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top right, #FF9800 0%, #1f6b22 30%, #022404 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </motion.section>

      <section className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl text-[#1B4332] mb-3"
        >
          Shop by Category
        </motion.h3>
        <p className="text-[#1B4332]/70 mb-6">
          Browse live categories from the backend catalog.
        </p>

        {catalogError && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {catalogError}
          </div>
        )}

        {catalogLoading ? (
          <div className="rounded-2xl bg-white px-6 py-8 text-[#1B4332]/60 shadow-sm">
            Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                onClick={() => handleCategoryClick(category.name)}
                isSelected={selectedCategory === category.name}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 overflow-hidden"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#1B4332]/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-2xl text-[#1B4332] font-serif mb-2">
                      {selectedCategory}
                    </h4>
                    <p className="text-[#1B4332]/70">
                      {visibleProducts.length} matching items available
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-2 bg-[#F8F4E1] text-[#1B4332] rounded-full text-sm hover:bg-[#1B4332] hover:text-white transition-colors"
                  >
                    Clear Selection
                  </motion.button>
                </div>

                {visibleProducts.length === 0 ? (
                  <div className="rounded-2xl bg-[#F8F4E1] px-6 py-8 text-[#1B4332]/60">
                    No products match this category and search yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {visibleProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        onAddToCart={addToCart}
                        onUpdateQuantity={updateQuantity}
                        quantity={getItemQuantity(product.id)}
                        cartIconRef={cartIconRef}
                        disabled={isCartSubmitting}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section
        id="products-section"
        className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h3 className="text-2xl md:text-3xl text-[#1B4332] mb-2">
            Fresh Picks Today
          </h3>
          <p className="text-[#1B4332]/70">
            {normalizedSearch
              ? `Showing results for "${searchQuery.trim()}"`
              : "Handpicked produce, harvested this morning"}
          </p>
        </motion.div>

        {catalogLoading ? (
          <div className="rounded-2xl bg-white px-6 py-8 text-[#1B4332]/60 shadow-sm">
            Loading products...
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-8 text-[#1B4332]/60 shadow-sm">
            No live products matched your current filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
                quantity={getItemQuantity(product.id)}
                cartIconRef={cartIconRef}
                disabled={isCartSubmitting}
              />
            ))}
          </div>
        )}
      </section>

      <section className="py-12 md:py-16 bg-[#F8F4E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl md:text-4xl text-[#1B4332] mb-4 font-serif">
              The FarmTatva Difference
            </h3>
            <p className="text-[#1B4332]/70 text-lg max-w-2xl mx-auto">
              From farm to fridge, we reimagine freshness with every delivery
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Sprout}
              title="Source Fresh"
              description="We select the best arrivals at the city's central market every dawn."
              index={0}
            />
            <FeatureCard
              icon={Ban}
              title="Zero Extra Margins"
              description="By bypassing local shops, we pass the savings directly to you."
              index={1}
            />
            <FeatureCard
              icon={CalendarRange}
              title="Stock for the Week"
              description="Premium quality that stays fresh in your fridge for 7 days."
              index={2}
            />
          </div>
        </div>
      </section>

      <footer className="bg-[#1B4332] text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6" />
                <h4 className="text-xl font-serif">FarmTatva</h4>
              </div>
              <p className="text-white/80 text-sm">
                Bringing the essence of farm-fresh produce directly to your
                doorstep
              </p>
            </div>
            <div>
              <h5 className="mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm text-white/80">
                <li>About Us</li>
                <li>Our Farmers</li>
                <li>Delivery Areas</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4">Contact</h5>
              <p className="text-sm text-white/80">
                Email: hello@farmtatva.com
                <br />
                Phone: +91 98765 43210
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
            © 2026 FarmTatva. All rights reserved.
          </div>
        </div>
      </footer>

      <FloatingCartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        lastAddedItem={cart[cart.length - 1]}
        onViewCart={() => setShowCartOverlay(true)}
      />

      <CartOverlay
        isOpen={showCartOverlay}
        onClose={() => setShowCartOverlay(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        totalPrice={totalPrice}
        isAuthenticated={Boolean(authToken)}
        selectedDeliveryArea={selectedDeliveryArea}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onOpenDeliveryAreaPicker={openDeliveryAreaDialog}
        onAddAddress={handleAddAddress}
        isCartLoading={isCartSubmitting}
        isAddressLoading={isAddressLoading}
        isAddressSubmitting={isAddressSubmitting}
        isCheckoutLoading={isCheckoutSubmitting}
        message={cartMessage}
        onCheckout={handleCheckout}
      />

      <DeliveryAreaDialog
        isOpen={showDeliveryAreaDialog}
        areas={deliveryAreas}
        selectedAreaId={selectedDeliveryAreaId}
        isLoading={isDeliveryAreaLoading}
        error={deliveryAreaError}
        onConfirm={handleSelectDeliveryArea}
        onClose={selectedDeliveryArea ? () => setShowDeliveryAreaDialog(false) : undefined}
      />

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={closeLoginDialog}
        onSubmit={handleAuthSubmit}
        isSubmitting={isAuthSubmitting}
        errorMessage={authError}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
