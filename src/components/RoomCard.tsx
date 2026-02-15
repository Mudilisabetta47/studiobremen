import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Maximize2, ArrowRight } from "lucide-react";

interface RoomCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  guests: number;
  size: string;
  index: number;
}

const RoomCard = ({ id, title, description, price, image, guests, size, index }: RoomCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <Link to={`/zimmer/${id}`} className="group block">
        <div className="overflow-hidden rounded-lg bg-card border border-border shadow-md hover:shadow-xl transition-shadow duration-500">
          {/* Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-1.5 rounded-sm">
              <span className="font-display text-lg font-semibold">€{price}</span>
              <span className="font-body text-xs text-primary-foreground/70"> / Nacht</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
              {title}
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">
              {description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users size={14} /> {guests} Gäste
                </span>
                <span className="flex items-center gap-1">
                  <Maximize2 size={14} /> {size}
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-accent uppercase tracking-wider group-hover:gap-2 transition-all">
                Details <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RoomCard;
