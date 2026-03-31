import { useEffect, useId, useRef } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const init = () => {
      if (ref.current && (window as any).BookingToolIframe) {
        ref.current.innerHTML = "";
        (window as any).BookingToolIframe.initialize({
          url,
          baseUrl: "https://login.smoobu.com",
          target: `#smoobu-${id}`,
        });
      }
    };

    if ((window as any).BookingToolIframe) {
      init();
      return () => { if (ref.current) ref.current.innerHTML = ""; };
    }

    const script = document.createElement("script");
    script.src = "https://login.smoobu.com/js/Settings/BookingToolIframe.js";
    script.onload = init;
    document.body.appendChild(script);
    return () => { if (ref.current) ref.current.innerHTML = ""; };
  }, [url, id]);

  return (
    <div
      id={`smoobu-${id}`}
      ref={ref}
      className="min-h-[800px] rounded-b-lg overflow-hidden"
      style={{ minWidth: 0 }}
    />
  );
};

/* Ensure Smoobu iframe date inputs are fully visible */
const smoobuStyles = `
  [id^="smoobu-"] input[type="date"],
  [id^="smoobu-"] input[type="text"] {
    width: 100% !important;
    min-width: 0 !important;
  }
  [id^="smoobu-"] iframe {
    width: 100% !important;
    min-width: 0 !important;
  }
`;

const StickyBookingWidget = ({ roomId, roomTitle, pricePerNight, maxGuests, size, smoobuIframeUrl }: StickyBookingWidgetProps) => {
  return (
    <>
      <style>{smoobuStyles}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="sticky top-24 min-w-0"
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
    </>
  );
};

export default StickyBookingWidget;
