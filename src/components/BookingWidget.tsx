import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Users, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const BookingWidget = () => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [location, setLocation] = useState("all");
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("location")
        .eq("is_active", true);

      if (data) {
        const unique = [...new Set(data.map((r) => r.location).filter(Boolean))] as string[];
        unique.sort();
        setLocations(unique);
      }
    };
    fetchLocations();
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Standort */}
        <div>
          <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <MapPin size={14} />
            Standort
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Alle Standorte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Standorte</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Anreise */}
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

        {/* Abreise */}
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

        {/* Gäste */}
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
