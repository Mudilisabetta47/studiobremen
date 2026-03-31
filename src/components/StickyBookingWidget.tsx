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

const SMOOBU_SCRIPT_SRC = "https://login.smoobu.com/js/Settings/BookingToolIframe.js";

const SmoobuIframe = ({ url, roomTitle }: { url: string; roomTitle: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const containerId = `smoobu-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled || initializedRef.current || !containerRef.current) return;

      const bookingTool = (window as any).BookingToolIframe;
      if (!bookingTool?.initialize) return;

      bookingTool.initialize({
        url,
        baseUrl: "https://login.smoobu.com",
        target: `#${containerId}`,
      });

      initializedRef.current = true;
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${SMOOBU_SCRIPT_SRC}"]`,
    );

    if ((window as any).BookingToolIframe?.initialize) {
      init();
    } else if (existingScript) {
      existingScript.addEventListener("load", init, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = SMOOBU_SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", init, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [url, containerId]);

  return (
    <div className="rounded-b-lg min-w-0 bg-card">
      <div
        id={containerId}
        ref={containerRef}
        aria-label={`Buchungstool für ${roomTitle}`}
        className="h-[2070px] w-full min-w-0"
      />
    </div>
  );
};

const smoobuStyles = `
  [id^="smoobu-"] {
    min-width: 0 !important;
    width: 100% !important;
  }

  [id^="smoobu-"] iframe {
    width: 100% !important;
    min-width: 0 !important;
    height: 2070px !important;
    min-height: 2070px !important;
    border: 0 !important;
    display: block !important;
  }
`;

const StickyBookingWidget = ({ roomId, roomTitle, pricePerNight, maxGuests, size, smoobuIframeUrl }: StickyBookingWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="min-w-0"
    >
      <style>{smoobuStyles}</style>

      {smoobuIframeUrl ? (
        <div className="bg-card border border-border rounded-lg min-w-0">
          <SmoobuIframe url={smoobuIframeUrl} roomTitle={roomTitle} />
        </div>
      ) : (
        <>
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
          <div className="[&>div]:rounded-t-none [&>div]:border-t-0">
            <BookingForm
              roomId={roomId}
              roomTitle={roomTitle}
              pricePerNight={pricePerNight}
              maxGuests={maxGuests}
            />
          </div>
        </>
      )}
    </motion.div>
  );
};

export default StickyBookingWidget;

