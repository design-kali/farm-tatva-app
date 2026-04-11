import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Plus, Minus, Clock } from 'lucide-react';
import { useState, useRef } from 'react';

interface ProductCardProps {
  product: {
    name: string;
    price: number;
    unit: string;
    image: string;
    tatvaScore: number;
    farmer: string;
    deliveryTime: string;
  };
  index: number;
  onAddToCart: (product: any) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  quantity: number;
  cartIconRef: React.RefObject<HTMLDivElement>;
}

export function ProductCard({ product, index, onAddToCart, onUpdateQuantity, quantity, cartIconRef }: ProductCardProps) {
  const [flyingLeaf, setFlyingLeaf] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = () => {
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
        <div className="absolute top-3 left-3 bg-[#1B4332] text-white text-xs px-3 py-1.5 rounded-lg shadow-md">
          Market Fresh Today
        </div>

        {/* Tatva Score Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-md">
          {[...Array(5)].map((_, i) => (
            <Leaf
              key={i}
              className={`w-3 h-3 ${
                i < product.tatvaScore
                  ? 'text-[#1B4332] fill-[#1B4332]'
                  : 'text-[#1B4332]/20 fill-[#1B4332]/20'
              }`}
            />
          ))}
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

        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[#1B4332] text-lg">₹{product.price}</span>
            <span className="text-[#1B4332]/60 text-sm ml-1">/{product.unit}</span>
          </div>

          <div ref={buttonRef} className="relative">
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
                  className="w-9 h-9 bg-[#1B4332] text-white rounded-full flex items-center justify-center hover:bg-[#2D6A4F] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.div
                  key="quantity-selector"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2 bg-[#1B4332] text-white rounded-full px-2 py-1.5"
                >
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onUpdateQuantity(product.name, -1)}
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
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
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
          <a
            href="#"
            className="text-xs text-[#1B4332]/60 hover:text-[#1B4332] underline decoration-dotted underline-offset-2 transition-colors"
          >
            Buy 2kg+ and save 15%
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
