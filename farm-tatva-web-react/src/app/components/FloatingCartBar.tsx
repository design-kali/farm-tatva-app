import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface FloatingCartBarProps {
  totalItems: number;
  totalPrice: number;
  lastAddedItem?: {
    name: string;
    image: string;
  };
  onViewCart: () => void;
}

export function FloatingCartBar({ totalItems, totalPrice, lastAddedItem, onViewCart }: FloatingCartBarProps) {
  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
        >
          <motion.button
            onClick={onViewCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#F8F4E1] rounded-full shadow-2xl px-6 py-4 flex items-center justify-between border-2 border-[#1B4332]/10"
          >
            {/* Left Side - Items Info */}
            <div className="flex items-center gap-3">
              {lastAddedItem && (
                <motion.div
                  key={lastAddedItem.name}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                  className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-[#1B4332]/20"
                >
                  <img
                    src={lastAddedItem.image}
                    alt={lastAddedItem.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
              <div className="text-left">
                <motion.p
                  key={totalItems}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="text-[#1B4332]"
                >
                  {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                </motion.p>
                <p className="text-sm text-[#1B4332]/60">in your basket</p>
              </div>
            </div>

            {/* Right Side - Price & Button */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <motion.p
                  key={totalPrice}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-serif text-[#1B4332]"
                >
                  Rs {totalPrice.toFixed(2)}
                </motion.p>
              </div>
              <div className="flex items-center gap-1 text-[#1B4332]">
                <span className="hidden sm:inline">View Basket</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
