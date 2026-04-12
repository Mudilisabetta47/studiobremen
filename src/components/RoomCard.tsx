import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Maximize2, Star, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/zimmer/${id}`} className="group block bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Image with overlay text */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Title on image */}
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="font-display text-lg md:text-xl font-bold text-white leading-snug mb-1">
              {title}
            </h3>
            {location && (
              <p className="flex items-center gap-1 text-xs text-white/80 font-body">
                <MapPin size={12} /> {location}
              </p>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 space-y-3">
          {/* Meta row */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-body">
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {guests} Gäste
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Maximize2 size={14} /> {size}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Star size={14} className="text-accent fill-accent" /> 4.7
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {["WLAN", "Küche", "Zentral"].map((tag) => (
              <span key={tag} className="text-xs font-body text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Price + CTA row */}
          <div className="flex items-end justify-between pt-2 border-t border-border">
            <div>
              <span className="text-xs font-body text-muted-foreground block">ab</span>
              <span className="font-display text-2xl font-bold text-accent">€{price}</span>
              <span className="text-sm font-body text-muted-foreground"> / Nacht</span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground gap-1.5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              Details <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RoomCard;
