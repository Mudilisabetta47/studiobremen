import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BookingWidget = () => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-card border border-border shadow-xl rounded-lg p-6 md:p-8"
    >
      <h3 className="font-display text-xl font-semibold text-foreground mb-6 text-center">
        Verfügbarkeit prüfen
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <CalendarDays size={14} />
            Anreise
          </label>
          <Input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="font-body"
          />
        </div>
        <div>
          <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <CalendarDays size={14} />
            Abreise
          </label>
          <Input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="font-body"
          />
        </div>
        <div>
          <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Users size={14} />
            Gäste
          </label>
          <Input
            type="number"
            min="1"
            max="6"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="font-body"
          />
        </div>
        <Button variant="hero" className="h-10 gap-2">
          <Search size={16} />
          Suchen
        </Button>
      </div>
    </motion.div>
  );
};

export default BookingWidget;
