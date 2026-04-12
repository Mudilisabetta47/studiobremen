import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import RoomCard from "@/components/RoomCard";
import BookingWidget, { BookingFilters } from "@/components/BookingWidget";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useRooms } from "@/hooks/useRooms";
import { rooms as staticRooms } from "@/data/rooms";
import { Loader2, MapPin, SlidersHorizontal } from "lucide-react";

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
    <main className="pt-24 md:pt-28 bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl pt-2 mb-6">
        <Breadcrumbs items={[{ label: "Apartments" }]} />
      </div>

      {/* Page header — clean Airbnb style */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Unterkünfte in Bremen
          </h1>
          <p className="font-body text-muted-foreground text-base">
            {displayRooms.length} Apartment{displayRooms.length !== 1 ? "s" : ""} verfügbar
          </p>
        </motion.div>
      </div>

      {/* Filter bar */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl mb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <BookingWidget onSearch={setFilters} defaultFilters={initialFilters} />
        </motion.div>
      </div>

      {/* Divider */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="border-b border-border" />
      </div>

      {/* Room grid */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-10 pb-28">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={28} />
          </div>
        ) : displayRooms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body text-base">
              Keine Unterkünfte für Ihre Auswahl gefunden.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
