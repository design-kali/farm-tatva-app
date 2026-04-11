import { motion } from 'motion/react';
import { MapPin, Award } from 'lucide-react';

interface FarmerCardProps {
  farmer: {
    name: string;
    location: string;
    specialty: string;
    image: string;
    experience: string;
  };
  index: number;
}

export function FarmerCard({ farmer, index }: FarmerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Farmer Photo */}
      <div className="aspect-[4/3] overflow-hidden bg-[#F8F4E1]">
        <img
          src={farmer.image}
          alt={farmer.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Farmer Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-lg text-[#1B4332]">{farmer.name}</h4>
          <div className="flex items-center gap-1 text-xs text-[#1B4332]/70 bg-[#F8F4E1] px-2 py-1 rounded-full">
            <Award className="w-3 h-3" />
            {farmer.experience}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-[#1B4332]/60 mb-3">
          <MapPin className="w-4 h-4" />
          {farmer.location}
        </div>

        <p className="text-sm text-[#1B4332]/80">
          <span className="text-[#1B4332]">Specialty:</span> {farmer.specialty}
        </p>
      </div>
    </motion.div>
  );
}
