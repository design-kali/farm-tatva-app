import { motion, AnimatePresence } from "motion/react";
import { Leaf, Plus, Minus, Clock } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  calculatePricingBreakdown,
  formatQuantity,
  type ApiPricingOption,
  type ProductCardModel,
} from "../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ProductCardProps {
  product: ProductCardModel;
  index: number;
  onAddToCart: (
    product: ProductCardModel,
    pricingOption: ApiPricingOption,
  ) => void;
  onUpdateQuantity: (cartItemId: string, nextQuantity: number) => void;
  getCartLine: (
    productId: string,
    pricingOptionId: string,
  ) => { id: string; quantity: number } | null;
  cartIconRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}

export function ProductCard({
  product,
  index,
  onAddToCart,
  onUpdateQuantity,
  getCartLine,
  cartIconRef,
  disabled = false,
}: ProductCardProps) {
  const [flyingLeaf, setFlyingLeaf] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPricingOptionId, setSelectedPricingOptionId] = useState(
    product.defaultPricingOption.id,
  );
  const buttonRef = useRef<HTMLDivElement>(null);
  const isSoldOut = product.stock <= 0;
  const selectedPricingOption = useMemo(
    () =>
      product.pricingOptions.find(
        (option) => option.id === selectedPricingOptionId,
      ) || product.defaultPricingOption,
    [
      product.defaultPricingOption,
      product.pricingOptions,
      selectedPricingOptionId,
    ],
  );
  const cartLine = getCartLine(product.id, selectedPricingOption.id);
  const quantity = cartLine?.quantity || 0;
  const pricing = calculatePricingBreakdown(
    selectedPricingOption,
    Math.max(quantity, selectedPricingOption.minQuantity),
  );
  const offerDetails = useMemo(() => {
    const now = Date.now();
    const activeOffers = selectedPricingOption.offers
      .filter((offer) => {
        if (!offer.isActive) {
          return false;
        }

        if (offer.startsAt) {
          const startsAt = new Date(offer.startsAt).getTime();
          if (!Number.isNaN(startsAt) && startsAt > now) {
            return false;
          }
        }

        if (offer.endsAt) {
          const endsAt = new Date(offer.endsAt).getTime();
          if (!Number.isNaN(endsAt) && endsAt < now) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => a.minQuantity - b.minQuantity);

    if (activeOffers.length === 0) {
      return "No offers currently";
    }

    return activeOffers
      .map((offer) => {
        const discountLabel =
          offer.discountType === "PERCENTAGE"
            ? `${offer.discountValue}% off`
            : `Rs ${offer.discountValue} off per ${selectedPricingOption.unit}`;
        return `${discountLabel} from ${formatQuantity(offer.minQuantity)} ${selectedPricingOption.unit}`;
      })
      .join(" • ");
  }, [selectedPricingOption.offers, selectedPricingOption.unit]);

  const currentImage =
    product.images[currentImageIndex] || product.images[0] || "";
  const hasMultipleImages = product.images.length > 1;

  const handleAddToCart = () => {
    if (disabled || isSoldOut) {
      return;
    }

    onAddToCart(product, selectedPricingOption);
    setFlyingLeaf(true);
    setTimeout(() => setFlyingLeaf(false), 1000);
  };

  const handleDecrease = () => {
    const nextQuantity = Number(
      (quantity - selectedPricingOption.quantityStep).toFixed(3),
    );
    onUpdateQuantity(
      cartLine?.id || `${product.id}:${selectedPricingOption.id}`,
      nextQuantity,
    );
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

  const multiLineStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
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
      <div className="relative aspect-square overflow-hidden bg-[#F8F4E1]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {hasMultipleImages && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {hasMultipleImages && (
          <>
            <button
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  prev > 0 ? prev - 1 : product.images.length - 1,
                )
              }
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  prev < product.images.length - 1 ? prev + 1 : 0,
                )
              }
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              ›
            </button>
          </>
        )}

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-1 shadow-md min-w-[4.5rem]">
          <p className="text-[10px] text-right text-[#1B4332]/70">
            {product.stockStatusLabel}
          </p>
        </div>

        <div className="absolute bottom-3 left-3 bg-[#1B4332]/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {product.deliveryTime}
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-[#1B4332] mb-1 line-clamp-1">{product.name}</h4>
        <p className="text-xs text-[#1B4332]/60 mb-3" style={multiLineStyle}>
          {product.description}
        </p>

        <div className="mb-3">
          <label className="mb-1 block text-xs uppercase tracking-[0.15em] text-[#1B4332]/55">
            Unit
          </label>
          <Select
            value={selectedPricingOption.id}
            onValueChange={setSelectedPricingOptionId}
          >
            <SelectTrigger className="w-full rounded-2xl border-[#1B4332]/15 bg-[#F8F4E1] text-sm text-[#1B4332] focus-visible:border-[#1B4332]">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {product.pricingOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label} - Rs {option.price}/{option.unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-[#1B4332] text-lg">
                Rs {selectedPricingOption.price}
              </span>
              <span className="text-[#1B4332]/60 text-sm">
                /{selectedPricingOption.unit}
              </span>
            </div>
            <p className="text-xs text-[#1B4332]/55 mt-1">
              Offers: {offerDetails}
            </p>
            {pricing.appliedOffer && (
              <p className="mt-1 text-xs text-[#2D6A4F]">
                Bulk offer:{" "}
                {pricing.appliedOffer.discountType === "PERCENTAGE"
                  ? `${pricing.appliedOffer.discountValue}% off`
                  : `Rs ${pricing.appliedOffer.discountValue} off per ${selectedPricingOption.unit}`}{" "}
                from {formatQuantity(pricing.appliedOffer.minQuantity)}{" "}
                {selectedPricingOption.unit}
              </p>
            )}
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
                    onClick={handleDecrease}
                    disabled={disabled}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="min-w-[3rem] text-center text-sm"
                  >
                    {formatQuantity(quantity)}
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
      </div>
    </motion.div>
  );
}
