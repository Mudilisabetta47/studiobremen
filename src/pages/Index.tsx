import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import BookingWidget from "@/components/BookingWidget";
import RoomCard from "@/components/RoomCard";
import { useRooms } from "@/hooks/useRooms";
import { rooms as staticRooms } from "@/data/rooms";
import { Star, Loader2 } from "lucide-react";

const Index = () => {
  const { data: dbRooms, isLoading } = useRooms();

  const displayRooms = dbRooms && dbRooms.length > 0
    ? dbRooms.map((r) => ({
        id: r.slug,
        title: r.title,
        description: r.description ?? "",
        price: r.price_per_night,
        image: r.primary_image ?? "/placeholder.svg",
        guests: r.max_guests,
        size: r.size ?? "",
      }))
    : staticRooms;

  return (
    <main>
      <HeroSection />

      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <BookingWidget />
      </section>

      <section className="container mx-auto px-4 py-24 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent tracking-[0.2em] uppercase text-xs font-body mb-3">Seit 2020</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Norddeutsche Gastfreundschaft
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            Unser Boutique-Hotel verbindet modernen Komfort mit der Herzlichkeit Bremens.
            Ob Geschäftsreise oder Städtetrip – bei uns fühlen Sie sich willkommen.
          </p>
        </motion.div>
      </section>

      <section className="bg-secondary/50 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-accent tracking-[0.2em] uppercase text-xs font-body mb-3">Unsere Räume</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
              Zimmer & Apartments
            </h2>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayRooms.map((room, index) => (
                <RoomCard key={room.id} {...room} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-accent text-accent" />
              ))}
            </div>
            <blockquote className="font-display text-xl md:text-2xl italic text-foreground mb-6 leading-relaxed">
              „Ein wundervolles Hotel mit herausragendem Service. Wir kommen immer wieder gerne nach Bremen."
            </blockquote>
            <p className="font-body text-sm text-muted-foreground">— Maria & Thomas, München</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Index;
