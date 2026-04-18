import { motion, AnimatePresence } from "motion/react";
import { Leaf, Plus, Minus, Clock } from "lucide-react";
import { useState, useRef } from "react";
import type { ProductCardModel } from "../lib/api";

interface ProductCardProps {
  product: ProductCardModel;
  index: number;
  onAddToCart: (product: ProductCardModel) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  quantity: number;
  cartIconRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}

export function ProductCard({
  product,
  index,
  onAddToCart,
  onUpdateQuantity,
  quantity,
  cartIconRef,
  disabled = false,
}: ProductCardProps) {
  const [flyingLeaf, setFlyingLeaf] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const isSoldOut = product.stock <= 0;
  const bulkOrderMessage =
    product.unit === "basket"
      ? "Order 2+ baskets for better wholesale pricing"
      : `Order 3+ ${product.unit} for better wholesale pricing`;

  const handleAddToCart = () => {
    if (disabled || isSoldOut) {
      return;
    }

    onAddToCart(product);
    setFlyingLeaf(true);
    setTimeout(() => setFlyingLeaf(false), 1000);
  };

  const getLeafPosition = () => {
    if (!buttonRef.current || !cartIconRef.current) return { x: 0, y: 0 };

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const cartRect = cartIconRef.current.getBoundingClientRect();

    return {
      x: cartRect.left - buttonRect.left,
      y: cartRect.top - buttonRect.top,
    };
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#F8F4E1]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {/* Market Fresh Today Label */}
        {/* <div className="absolute top-3 left-3 bg-[#1B4332] text-white text-xs px-3 py-1.5 rounded-lg shadow-md">
          Market Fresh Today
        </div> */}

        {/* Stock Availability Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-md min-w-[5.5rem]">
          <div className="flex items-center justify-end gap-1">
            {[...Array(5)].map((_, i) => (
              <Leaf
                key={i}
                className={`w-3 h-3 ${
                  i < product.stockLeafCount
                    ? "text-[#1B4332] fill-[#1B4332]"
                    : "text-[#1B4332]/20 fill-[#1B4332]/20"
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-right text-[#1B4332]/70 mt-1">
            {product.stockStatusLabel}
          </p>
        </div>

        {/* Delivery Time */}
        <div className="absolute bottom-3 left-3 bg-[#1B4332]/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {product.deliveryTime}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h4 className="text-[#1B4332] mb-1 line-clamp-1">{product.name}</h4>
        <p className="text-xs text-[#1B4332]/60 mb-3">by {product.farmer}</p>

        <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-[#1B4332] text-lg">₹{product.price}</span>
              <span className="text-[#1B4332]/60 text-sm">/{product.unit}</span>
            </div>
          </div>

          <div
            ref={buttonRef}
            className="relative self-start shrink-0 sm:self-auto"
          >
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add-button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  disabled={disabled || isSoldOut}
                  className="min-w-[2.25rem] h-9 bg-[#1B4332] text-white rounded-full flex items-center justify-center hover:bg-[#2D6A4F] transition-colors disabled:bg-[#1B4332]/30 disabled:cursor-not-allowed px-3"
                >
                  {isSoldOut ? (
                    <span className="text-xs">Sold Out</span>
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </motion.button>
              ) : (
                <motion.div
                  key="quantity-selector"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1.5 bg-[#1B4332] text-white rounded-full px-2 py-1.5 sm:gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onUpdateQuantity(product.id, -1)}
                    disabled={disabled}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="w-6 text-center"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddToCart}
                    disabled={disabled}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flying Leaf Animation */}
            <AnimatePresence>
              {flyingLeaf && (
                <motion.div
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{
                    opacity: 0,
                    x: getLeafPosition().x,
                    y: getLeafPosition().y,
                    scale: 0.5,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute top-0 left-0 pointer-events-none"
                >
                  <Leaf className="w-6 h-6 text-[#1B4332] fill-[#1B4332]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bulk Incentive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-2"
        >
          <p className="text-xs text-[#1B4332]/60">
            {isSoldOut
              ? "Bulk pre-orders open for the next harvest"
              : bulkOrderMessage}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
