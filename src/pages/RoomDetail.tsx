import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Maximize2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingForm from "@/components/BookingForm";
import { useRoom } from "@/hooks/useRooms";
import { rooms as staticRooms } from "@/data/rooms";

const RoomDetail = () => {
  const { id } = useParams();
  const { data: dbRoom, isLoading } = useRoom(id);

  // Fallback to static data
  const staticRoom = staticRooms.find((r) => r.id === id);

  const room = dbRoom
    ? {
        id: dbRoom.slug,
        title: dbRoom.title,
        description: dbRoom.description ?? "",
        longDescription: dbRoom.long_description ?? "",
        price: dbRoom.price_per_night,
        image: dbRoom.primary_image ?? "/placeholder.svg",
        guests: dbRoom.max_guests,
        size: dbRoom.size ?? "",
        amenities: dbRoom.amenities ?? [],
        dbId: dbRoom.id,
      }
    : staticRoom
    ? { ...staticRoom, dbId: staticRoom.id }
    : null;

  if (isLoading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </main>
    );
  }

  if (!room) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-4">Zimmer nicht gefunden</h1>
          <Link to="/zimmer">
            <Button variant="hero">Zurück zur Übersicht</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Link to="/zimmer" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-accent transition-colors text-sm font-body mb-4">
                <ArrowLeft size={16} /> Alle Zimmer
              </Link>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">{room.title}</h1>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Users size={16} className="text-accent" /> Bis zu {room.guests} Gäste</span>
                <span className="flex items-center gap-1.5"><Maximize2 size={16} className="text-accent" /> {room.size}</span>
              </div>

              <h2 className="font-display text-2xl font-semibold mb-4">Beschreibung</h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-10">{room.longDescription}</p>

              <h2 className="font-display text-2xl font-semibold mb-4">Ausstattung</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <Check size={14} className="text-accent flex-shrink-0" />
                    {amenity}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <div className="sticky top-24">
              <BookingForm
                roomId={room.dbId}
                roomTitle={room.title}
                pricePerNight={room.price}
                maxGuests={room.guests}
              />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default RoomDetail;
