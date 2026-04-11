import { motion } from 'motion/react';

interface CategoryCardProps {
  category: {
    name: string;
    image: string;
    count: string;
  };
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      <div className="aspect-square overflow-hidden bg-[#F8F4E1]">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 text-center">
        <h4 className="text-[#1B4332] mb-1">{category.name}</h4>
        <p className="text-sm text-[#1B4332]/60">{category.count}</p>
      </div>
    </motion.div>
  );
}
