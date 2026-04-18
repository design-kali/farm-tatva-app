import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, Leaf, Truck } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
  farmer: string;
}

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  totalPrice: number;
}

export function CartOverlay({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  totalPrice,
}: CartOverlayProps) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1B4332]/10">
              <div>
                <h2 className="text-2xl text-[#1B4332] font-serif">
                  Your Basket
                </h2>
                <p className="text-sm text-[#1B4332]/60">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F8F4E1] text-[#1B4332]"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Leaf className="w-16 h-16 text-[#1B4332]/20 mb-4" />
                  <p className="text-[#1B4332]/60">Your basket is empty</p>
                  <p className="text-sm text-[#1B4332]/40 mt-2">
                    Add some fresh produce to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 bg-[#F8F4E1]/30 rounded-2xl p-4"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#1B4332] mb-1 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#1B4332]/60 mb-2">
                          by {item.farmer}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[#1B4332]">
                            ₹{item.price}{" "}
                            <span className="text-sm text-[#1B4332]/60">
                              /{item.unit}
                            </span>
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-[#1B4332] text-white rounded-full px-2 py-1">
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="w-6 text-center text-sm">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#1B4332]/10 px-6 py-5 bg-[#F8F4E1]/50">
                {/* Farm-to-Home Promise */}
                <div className="flex items-center gap-2 mb-4 text-[#1B4332]/70 text-sm">
                  <Truck className="w-4 h-4 text-[#1B4332]" />
                  <span>Farm-Fresh Delivery by Morning</span>
                </div>

                {/* Total & Checkout */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[#1B4332]/60">Total Amount</p>
                    <p className="text-2xl font-serif text-[#1B4332]">
                      ₹{totalPrice}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#1B4332] text-white py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#2D6A4F] transition-colors"
                >
                  <span className="text-lg">Proceed to Checkout</span>
                  <Leaf className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
