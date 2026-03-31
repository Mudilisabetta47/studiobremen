import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import RoomCard from "@/components/RoomCard";
import BookingWidget, { BookingFilters } from "@/components/BookingWidget";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useRooms } from "@/hooks/useRooms";
import { rooms as staticRooms } from "@/data/rooms";
import { Loader2 } from "lucide-react";

const Rooms = () => {
  const { data: dbRooms, isLoading } = useRooms();
  const [searchParams] = useSearchParams();

  const initialFilters: BookingFilters = {
    location: searchParams.get("location") || "all",
    guests: searchParams.get("guests") || "1",
  };

  const [filters, setFilters] = useState<BookingFilters>(initialFilters);

  const displayRooms = useMemo(() => {
    const base = dbRooms && dbRooms.length > 0
      ? dbRooms.map((r) => ({
          id: r.slug,
          title: r.title,
          description: r.description ?? "",
          price: r.price_per_night,
          image: r.primary_image ?? "/placeholder.svg",
          guests: r.max_guests,
          size: r.size ?? "",
          location: r.location ?? "",
        }))
      : staticRooms.map((r) => ({ ...r, location: "" }));

    return base.filter((room) => {
      if (filters.location !== "all" && room.location && room.location !== filters.location) {
        return false;
      }
      const guestCount = parseInt(filters.guests, 10);
      if (!isNaN(guestCount) && guestCount > 0 && room.guests < guestCount) {
        return false;
      }
      return true;
    });
  }, [dbRooms, filters]);

  return (
    <main className="pt-20">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: "Zimmer & Apartments" }]} />
      </div>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent tracking-[0.2em] uppercase text-xs font-body mb-3">Unterkünfte</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Zimmer & Apartments
            </h1>
            <p className="font-body text-primary-foreground/70 max-w-lg mx-auto">
              Wählen Sie aus unseren komfortablen Zimmern und Apartments – jedes mit eigenem Charakter.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-16">
        <BookingWidget onSearch={setFilters} defaultFilters={initialFilters} />
      </section>

      <section className="container mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : displayRooms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body text-lg">
              Keine Unterkünfte für Ihre Auswahl gefunden. Bitte passen Sie die Filter an.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayRooms.map((room, index) => (
              <RoomCard key={room.id} {...room} index={index} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Rooms;
