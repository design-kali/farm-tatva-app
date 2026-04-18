import { motion } from "motion/react";

interface CategoryCardProps {
  category: {
    name: string;
    image: string;
    count: string;
  };
  index: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function CategoryCard({
  category,
  index,
  onClick,
  isSelected = false,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isSelected
          ? "bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] ring-4 ring-[#1B4332]/30"
          : "bg-white"
      }`}
    >
      <div className="aspect-square overflow-hidden bg-[#F8F4E1]">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 text-center">
        <h4 className={isSelected ? "text-white" : "text-[#1B4332]"}>
          {category.name}
        </h4>
        <p
          className={`text-sm ${isSelected ? "text-white/80" : "text-[#1B4332]/60"}`}
        >
          {category.count}
        </p>
      </div>
    </motion.div>
  );
}
