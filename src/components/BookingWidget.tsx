import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Users, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export interface BookingFilters {
  location: string;
  guests: string;
  checkIn?: Date;
  checkOut?: Date;
}

interface BookingWidgetProps {
  onSearch?: (filters: BookingFilters) => void;
}

const BookingWidget = ({ onSearch }: BookingWidgetProps) => {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
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

  const handleSearch = () => {
    onSearch?.({ location, guests, checkIn, checkOut });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-card border border-border shadow-xl rounded-xl p-6 md:p-8"
    >
      <h3 className="font-display text-xl font-semibold text-foreground mb-6 text-center">
        Verfügbarkeit prüfen
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Standort */}
        <div>
          <label className="text-[11px] font-body uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <MapPin size={13} className="text-accent" />
            Standort
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="font-body h-11 border-border/60 focus:ring-accent">
              <SelectValue placeholder="Alle Standorte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Standorte</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Anreise */}
        <div>
          <label className="text-[11px] font-body uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <CalendarDays size={13} className="text-accent" />
            Anreise
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex h-11 w-full items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-sm font-body transition-colors",
                  "hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
                  !checkIn && "text-muted-foreground",
                )}
              >
                <CalendarDays size={14} className="text-accent shrink-0" />
                {checkIn ? format(checkIn, "dd. MMM yyyy", { locale: de }) : "Datum wählen"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                locale={de}
                disabled={(date) => date < new Date()}
                className="pointer-events-auto"
                classNames={{
                  day_selected: "bg-accent text-accent-foreground hover:bg-accent/90",
                  day_today: "bg-accent/10 text-accent font-bold",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Abreise */}
        <div>
          <label className="text-[11px] font-body uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <CalendarDays size={13} className="text-accent" />
            Abreise
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex h-11 w-full items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-sm font-body transition-colors",
                  "hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
                  !checkOut && "text-muted-foreground",
                )}
              >
                <CalendarDays size={14} className="text-accent shrink-0" />
                {checkOut ? format(checkOut, "dd. MMM yyyy", { locale: de }) : "Datum wählen"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                locale={de}
                disabled={(date) => date < (checkIn ?? new Date())}
                className="pointer-events-auto"
                classNames={{
                  day_selected: "bg-accent text-accent-foreground hover:bg-accent/90",
                  day_today: "bg-accent/10 text-accent font-bold",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Gäste */}
        <div>
          <label className="text-[11px] font-body uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <Users size={13} className="text-accent" />
            Gäste
          </label>
          <Input
            type="number"
            min="1"
            max="6"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="font-body h-11 border-border/60 focus-visible:ring-accent"
          />
        </div>

        <Button
          variant="hero"
          className="h-11 gap-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          onClick={handleSearch}
        >
          <Search size={16} />
          Suchen
        </Button>
      </div>
    </motion.div>
  );
};

export default BookingWidget;
