import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Users, Maximize2 } from "lucide-react";
import BookingForm from "./BookingForm";

interface StickyBookingWidgetProps {
  roomId: string;
  roomTitle: string;
  pricePerNight: number;
  maxGuests: number;
  size: string;
  smoobuIframeUrl?: string;
}

const SmoobuIframe = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://login.smoobu.com/js/Settings/BookingToolIframe.js";
    script.onload = () => {
      if ((window as any).BookingToolIframe) {
        (window as any).BookingToolIframe.initialize({
          url,
          baseUrl: "https://login.smoobu.com",
          target: "#smoobu-iframe-container",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [url]);

  return (
    <div
      id="smoobu-iframe-container"
      ref={containerRef}
      className="min-h-[500px] rounded-b-lg overflow-hidden"
    />
  );
};

const StickyBookingWidget = ({ roomId, roomTitle, pricePerNight, maxGuests, size, smoobuIframeUrl }: StickyBookingWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="sticky top-24"
    >
      {/* Price header */}
      <div className="bg-card border border-border rounded-t-lg p-5 border-b-0">
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="font-display text-3xl font-bold text-foreground">€{pricePerNight}</span>
          <span className="text-sm font-body text-muted-foreground">/ Nacht</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-body text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-accent fill-accent" /> 4.7 Hervorragend
          </span>
          <span>·</span>
          <span className="flex items-center gap-1"><Users size={12} /> {maxGuests} Gäste</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Maximize2 size={12} /> {size}</span>
        </div>
      </div>

      {smoobuIframeUrl ? (
        <div className="bg-card border border-border rounded-b-lg border-t-0">
          <SmoobuIframe url={smoobuIframeUrl} />
        </div>
      ) : (
        <div className="[&>div]:rounded-t-none [&>div]:border-t-0">
          <BookingForm
            roomId={roomId}
            roomTitle={roomTitle}
            pricePerNight={pricePerNight}
            maxGuests={maxGuests}
          />
        </div>
      )}
    </motion.div>
  );
};

export default StickyBookingWidget;
