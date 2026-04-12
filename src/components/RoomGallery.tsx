import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomGalleryProps {
  images: string[];
  title: string;
}

const SWIPE_THRESHOLD = 50;

const RoomGallery = ({ images, title }: RoomGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const displayImages = [...new Set(images.length > 0 ? images : ["/placeholder.svg"])];
  const imageCount = displayImages.length;

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setActiveIndex((prev) => (prev + dir + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          navigate(-1);
          break;
        case "ArrowRight":
        case " ":
          e.preventDefault();
          navigate(1);
          break;
        case "Escape":
          setLightboxOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, navigate]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    // Only swipe if horizontal movement is dominant
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) navigate(1);
      else navigate(-1);
    }
    touchStart.current = null;
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  // Mobile carousel for grid view
  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileTouch = useRef<{ x: number } | null>(null);

  const handleMobileTouchStart = (e: React.TouchEvent) => {
    mobileTouch.current = { x: e.touches[0].clientX };
  };
  const handleMobileTouchEnd = (e: React.TouchEvent) => {
    if (!mobileTouch.current) return;
    const dx = e.changedTouches[0].clientX - mobileTouch.current.x;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0 && mobileIndex < displayImages.length - 1) setMobileIndex(mobileIndex + 1);
      else if (dx > 0 && mobileIndex > 0) setMobileIndex(mobileIndex - 1);
    }
    mobileTouch.current = null;
  };

  return (
    <>
      {imageCount === 1 ? (
        <div
          className="relative group cursor-pointer rounded-xl overflow-hidden h-[420px] md:h-[500px]"
          onClick={() => { setActiveIndex(0); setLightboxOpen(true); }}
        >
          <img src={displayImages[0]} alt={`${title} - Hauptbild`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
          <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity gap-1.5">
            <Expand size={14} /> Foto ansehen
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile: swipeable carousel */}
          <div
            className="md:hidden relative rounded-xl overflow-hidden h-[300px] touch-pan-y"
            onTouchStart={handleMobileTouchStart}
            onTouchEnd={handleMobileTouchEnd}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={mobileIndex}
                src={displayImages[mobileIndex]}
                alt={`${title} - Bild ${mobileIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => { setActiveIndex(mobileIndex); setLightboxOpen(true); }}
              />
            </AnimatePresence>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {displayImages.map((_, i) => (
                <button
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === mobileIndex ? "bg-white w-5" : "bg-white/50 w-1.5"}`}
                  onClick={(e) => { e.stopPropagation(); setMobileIndex(i); }}
                />
              ))}
            </div>
            {/* Counter */}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-body px-2.5 py-1 rounded-full z-10">
              {mobileIndex + 1} / {imageCount}
            </div>
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[420px] md:h-[500px] rounded-xl overflow-hidden">
            <div
              className="col-span-2 row-span-2 relative group cursor-pointer"
              onClick={() => { setActiveIndex(0); setLightboxOpen(true); }}
            >
              <img src={displayImages[0]} alt={`${title} - Hauptbild`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
              <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity gap-1.5">
                <Expand size={14} /> Alle Fotos ({imageCount})
              </Button>
            </div>

            {displayImages.slice(1, 5).map((img, i) => {
              const realIndex = i + 1;
              const isLast = realIndex === Math.min(4, imageCount - 1) && imageCount > 5;
              return (
                <div
                  key={realIndex}
                  className="relative group cursor-pointer overflow-hidden"
                  onClick={() => { setActiveIndex(realIndex); setLightboxOpen(true); }}
                >
                  <img src={img} alt={`${title} - Bild ${realIndex + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                  {isLast && (
                    <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
                      <span className="font-display text-primary-foreground text-lg font-semibold">+{imageCount - 5} Fotos</span>
                    </div>
                  )}
                </div>
              );
            })}

            {imageCount < 5 && Array.from({ length: 5 - imageCount }, (_, i) => (
              <div key={`empty-${i}`} className="bg-muted/30 rounded-sm" />
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence mode="popLayout">
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
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
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10 z-10 hidden md:flex"
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                >
                  <ChevronLeft size={32} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10 z-10 hidden md:flex"
                  onClick={(e) => { e.stopPropagation(); navigate(1); }}
                >
                  <ChevronRight size={32} />
                </Button>
              </>
            )}

            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.img
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                src={displayImages[activeIndex]}
                alt={`${title} - Bild ${activeIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </AnimatePresence>

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
