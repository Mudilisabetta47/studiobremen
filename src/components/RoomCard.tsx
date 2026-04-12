import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Maximize2, Star, MapPin, Heart } from "lucide-react";
import { useState } from "react";

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
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/zimmer/${id}`} className="group block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Wishlist heart */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-colors z-10"
          >
            <Heart
              size={16}
              className={liked ? "fill-destructive text-destructive" : "text-foreground/70"}
            />
          </button>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-body text-[15px] font-semibold text-foreground leading-snug">
              {title}
            </h3>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Star size={13} className="text-accent fill-accent" />
              <span className="font-body text-sm text-foreground">4.7</span>
            </div>
          </div>

          {location && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground font-body">
              <MapPin size={13} /> {location}
            </p>
          )}

          <div className="flex items-center gap-3 text-sm text-muted-foreground font-body">
            <span className="flex items-center gap-1">
              <Users size={13} /> {guests} Gäste
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Maximize2 size={13} /> {size}
            </span>
          </div>

          <p className="font-body text-sm text-foreground pt-1">
            <span className="font-semibold">€{price}</span>
            <span className="text-muted-foreground"> / Nacht</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default RoomCard;
