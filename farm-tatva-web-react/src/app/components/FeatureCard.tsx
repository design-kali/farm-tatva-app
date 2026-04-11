import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="relative group"
    >
      <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 h-full border-2 border-transparent hover:border-[#1B4332]/10">
        {/* Icon Circle */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-2xl flex items-center justify-center mb-6 shadow-lg"
        >
          <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl text-[#1B4332] mb-3 font-serif">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[#1B4332]/70 leading-relaxed">
          {description}
        </p>

        {/* Decorative Corner */}
        <div className="absolute top-4 right-4 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-full border-t-2 border-r-2 border-[#1B4332]/10 rounded-tr-2xl"></div>
        </div>
      </div>
    </motion.div>
  );
}
