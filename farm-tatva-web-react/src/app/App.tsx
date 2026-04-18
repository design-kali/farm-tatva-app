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
import { useState, useRef } from "react";
import { ProductCard } from "./components/ProductCard";
import { FarmerCard } from "./components/FarmerCard";
import { CategoryCard } from "./components/CategoryCard";
import { FloatingCartBar } from "./components/FloatingCartBar";
import { CartOverlay } from "./components/CartOverlay";
import { FeatureCard } from "./components/FeatureCard";
import { LoginDialog } from "./components/LoginDialog";

interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
  farmer: string;
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartOverlay, setShowCartOverlay] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(
      selectedCategory === categoryName ? null : categoryName,
    );
  };

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.name);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prevCart,
        {
          id: product.name,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.image,
          quantity: 1,
          farmer: product.farmer,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item,
      );
      return updatedCart.filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const getItemQuantity = (productName: string) => {
    const item = cart.find((item) => item.id === productName);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const categories = [
    {
      name: "Fresh Vegetables",
      image:
        "https://images.unsplash.com/photo-1741515044901-58696421d24a?w=400&q=80",
      count: "150+ items",
    },
    {
      name: "Organic Fruits",
      image:
        "https://images.unsplash.com/flagged/photo-1570197275784-ad9f674f9231?w=400&q=80",
      count: "120+ items",
    },
    {
      name: "Leafy Greens",
      image:
        "https://images.unsplash.com/photo-1768776847082-9ddb43ec49ea?w=400&q=80",
      count: "80+ items",
    },
    {
      name: "Root Vegetables",
      image:
        "https://images.unsplash.com/photo-1741515043161-e97d05e5cfcc?w=400&q=80",
      count: "60+ items",
    },
  ];

  const farmers = [
    {
      name: "Rajesh Kumar",
      location: "Nashik, Maharashtra",
      specialty: "Organic Tomatoes & Leafy Greens",
      image:
        "https://images.unsplash.com/photo-1627829382469-f4bce7df99ba?w=400&q=80",
      experience: "15 years",
    },
    {
      name: "Priya Sharma",
      location: "Pune, Maharashtra",
      specialty: "Seasonal Fruits & Berries",
      image:
        "https://images.unsplash.com/photo-1657658852797-cb909647a6c8?w=400&q=80",
      experience: "12 years",
    },
    {
      name: "Arjun Patel",
      location: "Ahmedabad, Gujarat",
      specialty: "Root Vegetables & Herbs",
      image:
        "https://images.unsplash.com/photo-1632923057240-b6775e4db748?w=400&q=80",
      experience: "20 years",
    },
    {
      name: "Meera Devi",
      location: "Bangalore, Karnataka",
      specialty: "Exotic Vegetables",
      image:
        "https://images.unsplash.com/photo-1760445412155-41a14ebaf20a?w=400&q=80",
      experience: "10 years",
    },
  ];

  const featuredProducts = [
    {
      name: "Organic Tomatoes",
      price: 45,
      unit: "kg",
      image:
        "https://images.unsplash.com/flagged/photo-1570197275784-ad9f674f9231?w=600&q=80",
      tatvaScore: 5,
      farmer: "Rajesh Kumar",
      deliveryTime: "2 hours",
    },
    {
      name: "Fresh Carrots",
      price: 35,
      unit: "kg",
      image:
        "https://images.unsplash.com/photo-1741515044901-58696421d24a?w=600&q=80",
      tatvaScore: 5,
      farmer: "Arjun Patel",
      deliveryTime: "2 hours",
    },
    {
      name: "Mixed Vegetables Basket",
      price: 280,
      unit: "basket",
      image:
        "https://images.unsplash.com/photo-1657288089316-c0350003ca49?w=600&q=80",
      tatvaScore: 5,
      farmer: "Priya Sharma",
      deliveryTime: "3 hours",
    },
    {
      name: "Organic Cabbage",
      price: 30,
      unit: "kg",
      image:
        "https://images.unsplash.com/photo-1768776847082-9ddb43ec49ea?w=600&q=80",
      tatvaScore: 4,
      farmer: "Meera Devi",
      deliveryTime: "2 hours",
    },
    {
      name: "Fresh Blueberries",
      price: 320,
      unit: "kg",
      image:
        "https://images.unsplash.com/photo-1722553547284-4315a34b3b82?w=600&q=80",
      tatvaScore: 5,
      farmer: "Priya Sharma",
      deliveryTime: "2 hours",
    },
    {
      name: "Root Vegetables Mix",
      price: 40,
      unit: "kg",
      image:
        "https://images.unsplash.com/photo-1741515043161-e97d05e5cfcc?w=600&q=80",
      tatvaScore: 4,
      farmer: "Rajesh Kumar",
      deliveryTime: "3 hours",
    },
    {
      name: "Seasonal Fruits & Veggies",
      price: 450,
      unit: "basket",
      image:
        "https://images.unsplash.com/photo-1683511997653-6be0fc990ec9?w=600&q=80",
      tatvaScore: 5,
      farmer: "Arjun Patel",
      deliveryTime: "2 hours",
    },
    {
      name: "Fresh Market Produce",
      price: 95,
      unit: "kg",
      image:
        "https://images.unsplash.com/photo-1751200270667-cb13feeac24c?w=600&q=80",
      tatvaScore: 4,
      farmer: "Meera Devi",
      deliveryTime: "3 hours",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4E1]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#1B4332]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
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

            {/* Location & Delivery Info */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-[#1B4332]">
                <MapPin className="w-4 h-4" />
                <span>
                  Deliver to: <strong>Mumbai 400001</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#1B4332]">
                <Clock className="w-4 h-4" />
                <span>Delivered Fresh Every Morning</span>
              </div>
            </div>

            {/* User & Cart */}
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLoginDialog(true)}
                className="w-10 h-10 bg-[#F8F4E1] text-[#1B4332] rounded-full flex items-center justify-center border-2 border-[#1B4332]/10 hover:border-[#1B4332]/30 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>

              {/* Cart */}
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

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-4"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B4332]/60" />
              <input
                type="text"
                placeholder="Search for the essence of freshness..."
                className="w-full pl-14 pr-6 py-4 bg-[#F8F4E1] border-2 border-[#1B4332]/20 rounded-[32px] text-[#1B4332] placeholder:text-[#1B4332]/50 focus:outline-none focus:border-[#1B4332] transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-[#1B4332]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center py-12 md:py-16">
            {/* Left Content */}
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
                We skip the local shops and middle-stalls to bring you
                main-market freshness and wholesale prices directly to your
                kitchen.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-[#1B4332] rounded-full inline-flex items-center gap-2 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <span className="text-lg">Start Your Weekly Stock-Up</span>
                <Leaf className="w-5 h-5" />
              </motion.button>

              {/* Trust Indicators */}
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

            {/* Right Image */}
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
                {/* Overlay Badge */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                  <p className="text-sm text-[#1B4332]/60 mb-1">
                    Starting from
                  </p>
                  <p className="text-2xl font-serif text-[#1B4332]">₹35/kg</p>
                </div>
              </div>

              {/* Decorative Elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-[#F8F4E1] rounded-full opacity-20 blur-2xl"
              />
              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
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

        {/* Background Pattern */}

        <div
          className="absolute inset-0"
          style={{
            // This places a small orange glow in the top-right corner, fading into green
            background:
              "radial-gradient(circle at top right, #FF9800 0%, #1f6b22 30%, #022404 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
      </motion.section>

      {/* Categories */}
      <section className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl text-[#1B4332] mb-6"
        >
          Shop by Category
        </motion.h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              category={category}
              index={index}
              onClick={() => handleCategoryClick(category.name)}
              isSelected={selectedCategory === category.name}
            />
          ))}
        </div>

        {/* Category Products */}
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
                      {featuredProducts.length} fresh items available
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {featuredProducts.map((product, index) => (
                    <ProductCard
                      key={`${product.name}-${index}`}
                      product={product}
                      index={index}
                      onAddToCart={addToCart}
                      onUpdateQuantity={updateQuantity}
                      quantity={getItemQuantity(product.name)}
                      cartIconRef={cartIconRef}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Know Your Farmer */}

      {/*  

      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h3 className="text-2xl md:text-3xl text-[#1B4332] mb-2">Know Your Farmer</h3>
            <p className="text-[#1B4332]/70">
              Meet the dedicated farmers who grow your food with love and care
            </p>
          </motion.div>

          <div className="overflow-x-auto -mx-4 px-4 hide-scrollbar">
            <div className="flex gap-6 pb-4">
              {farmers.map((farmer, index) => (
                <FarmerCard key={farmer.name} farmer={farmer} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      */}

      {/* Featured Products */}
      <section className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Handpicked produce, harvested this morning
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={`${product.name}-${index}`}
              product={product}
              index={index}
              onAddToCart={addToCart}
              onUpdateQuantity={updateQuantity}
              quantity={getItemQuantity(product.name)}
              cartIconRef={cartIconRef}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
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

      {/* Footer */}
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

      {/* Floating Cart Bar */}
      <FloatingCartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        lastAddedItem={cart[cart.length - 1]}
        onViewCart={() => setShowCartOverlay(true)}
      />

      {/* Cart Overlay */}
      <CartOverlay
        isOpen={showCartOverlay}
        onClose={() => setShowCartOverlay(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        totalPrice={totalPrice}
      />

      {/* Login Dialog */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
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
