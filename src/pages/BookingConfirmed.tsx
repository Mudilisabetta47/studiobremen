import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const BookingConfirmed = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-xl text-center"
      >
        <CheckCircle2 className="mx-auto mb-4 text-accent" size={56} />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Zahlung erfolgreich!
        </h1>
        <p className="font-body text-muted-foreground mb-6">
          Vielen Dank für Ihre Buchung. Eine Bestätigungs-E-Mail wird Ihnen in Kürze zugeschickt.
        </p>
        {bookingId && (
          <p className="text-xs font-body text-muted-foreground mb-6">
            Buchungs-ID: <span className="font-mono">{bookingId.slice(0, 8)}</span>
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Link to="/">
            <Button variant="hero" className="w-full">
              <Home size={16} className="mr-2" /> Zurück zur Startseite
            </Button>
          </Link>
          <Link to="/meine-buchungen">
            <Button variant="outline" className="w-full">
              Meine Buchungen ansehen
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingConfirmed;
