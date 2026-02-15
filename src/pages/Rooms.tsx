import { motion } from "framer-motion";
import RoomCard from "@/components/RoomCard";
import BookingWidget from "@/components/BookingWidget";
import { rooms } from "@/data/rooms";

const Rooms = () => {
  return (
    <main className="pt-20">
      {/* Header */}
      <section className="bg-gradient-hotel py-20">
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

      {/* Booking Widget */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-16">
        <BookingWidget />
      </section>

      {/* Room Grid */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <RoomCard key={room.id} {...room} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Rooms;
