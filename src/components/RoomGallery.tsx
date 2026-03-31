import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomGalleryProps {
  images: string[];
  title: string;
}

const RoomGallery = ({ images, title }: RoomGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Deduplicate images
  const displayImages = [...new Set(images.length > 0 ? images : ["/placeholder.svg"])];

  const navigate = (dir: 1 | -1) => {
    setActiveIndex((prev) => (prev + dir + displayImages.length) % displayImages.length);
  };

  // Determine grid layout based on image count
  const imageCount = displayImages.length;

  return (
    <>
      {imageCount === 1 ? (
        /* Single image – full width */
        <div
          className="relative group cursor-pointer rounded-xl overflow-hidden h-[420px] md:h-[500px]"
          onClick={() => { setActiveIndex(0); setLightboxOpen(true); }}
        >
          <img
            src={displayImages[0]}
            alt={`${title} - Hauptbild`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
          >
            <Expand size={14} /> Foto ansehen
          </Button>
        </div>
      ) : imageCount === 2 ? (
        /* Two images side by side */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[420px] md:h-[500px] rounded-xl overflow-hidden">
          {displayImages.map((img, i) => (
            <div
              key={i}
              className="relative group cursor-pointer overflow-hidden"
              onClick={() => { setActiveIndex(i); setLightboxOpen(true); }}
            >
              <img
                src={img}
                alt={`${title} - Bild ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
            </div>
          ))}
        </div>
      ) : (
        /* 3+ images – hero + thumbnails */
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] md:h-[500px] rounded-xl overflow-hidden">
          {/* Hero image */}
          <div
            className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer"
            onClick={() => { setActiveIndex(0); setLightboxOpen(true); }}
          >
            <img
              src={displayImages[0]}
              alt={`${title} - Hauptbild`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
            >
              <Expand size={14} /> Alle Fotos ({imageCount})
            </Button>
          </div>

          {/* Thumbnails – only show actual available images */}
          {displayImages.slice(1, 5).map((img, i) => {
            const realIndex = i + 1;
            const isLast = realIndex === Math.min(4, imageCount - 1) && imageCount > 5;
            return (
              <div
                key={realIndex}
                className="hidden md:block relative group cursor-pointer overflow-hidden"
                onClick={() => { setActiveIndex(realIndex); setLightboxOpen(true); }}
              >
                <img
                  src={img}
                  alt={`${title} - Bild ${realIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                {isLast && (
                  <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
                    <span className="font-display text-primary-foreground text-lg font-semibold">
                      +{imageCount - 5} Fotos
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Fill empty slots with transparent divs if less than 5 total */}
          {imageCount < 5 && Array.from({ length: 5 - imageCount }, (_, i) => (
            <div key={`empty-${i}`} className="hidden md:block bg-muted/30 rounded-sm" />
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/10 z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={24} />
            </Button>

            {displayImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10 z-10"
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              >
                <ChevronLeft size={32} />
              </Button>
            )}

            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={displayImages[activeIndex]}
              alt={`${title} - Bild ${activeIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {displayImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10 z-10"
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
              >
                <ChevronRight size={32} />
              </Button>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <span className="text-primary-foreground/60 text-sm font-body">
                {activeIndex + 1} / {displayImages.length}
              </span>
              <div className="flex gap-1.5">
                {displayImages.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? "bg-accent w-5" : "bg-primary-foreground/40"}`}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RoomGallery;
