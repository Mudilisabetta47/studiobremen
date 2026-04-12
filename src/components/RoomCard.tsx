import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Maximize2, ArrowRight, MapPin } from "lucide-react";

interface RoomCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  guests: number;
  size: string;
  index: number;
  location?: string;
}

const RoomCard = ({ id, title, description, price, image, guests, size, index, location }: RoomCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
    >
      <Link to={`/zimmer/${id}`} className="group block">
        <div className="overflow-hidden bg-card">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Content */}
          <div className="pt-5 pb-2">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                {title}
              </h3>
              <div className="text-right shrink-0 ml-4">
                <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">ab</span>
                <span className="font-display text-lg font-semibold text-foreground ml-1">€{price}</span>
              </div>
            </div>

            {location && (
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground font-body mb-2">
                <MapPin size={10} /> {location}
              </p>
            )}

            <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
              {description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-body">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {guests} Gäste
                </span>
                <span className="flex items-center gap-1">
                  <Maximize2 size={12} /> {size}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-medium text-accent uppercase tracking-[0.2em] group-hover:gap-2 transition-all duration-300">
                Details <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RoomCard;
