import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Shield, Clock, Loader2, Users, Maximize2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import RoomGallery from "@/components/RoomGallery";
import AmenityGroups from "@/components/AmenityGroups";
import GuestReviews from "@/components/GuestReviews";
import StickyBookingWidget from "@/components/StickyBookingWidget";
import { useRoom } from "@/hooks/useRooms";
import { rooms as staticRooms } from "@/data/rooms";
import { useRef } from "react";

// Atmospheric descriptions per room type
const atmosphereTexts: Record<string, { headline: string; mood: string; highlight: string }> = {
  "stadtwohnung-nr-2": {
    headline: "Ihr urbaner Rückzugsort",
    mood: "Mitten im Herzen Bremens, nur wenige Schritte vom Hauptbahnhof entfernt, empfängt Sie dieses moderne Zimmer mit stilvoller Einrichtung und allem Komfort. Schnelles WLAN, ein bequemes Bett und eine voll ausgestattete Küche machen Ihren Aufenthalt perfekt.",
    highlight: "Genießen Sie die perfekte Balance zwischen urbanem Trubel und privatem Rückzug — die Altstadt liegt direkt vor Ihrer Tür.",
  },
  "city-apartment-no3": {
    headline: "Frisch & Modern im Stadtzentrum",
    mood: "Dieses frisch renovierte Apartment besticht durch geschmackvolle Einrichtung und liebevolle Details. Ein komfortables Doppelbett, eine moderne Kochnische und ein stylischer Bartisch laden zum Wohlfühlen ein. Das moderne Bad mit begehbarer Dusche rundet das Erlebnis ab.",
    highlight: "Nur eine Minute vom Hauptbahnhof — perfekt für Entdecker und Geschäftsreisende, die zentral und komfortabel wohnen möchten.",
  },
  "city-apartment-nr-4": {
    headline: "Stilvolle Oase am Rembertiring",
    mood: "Erleben Sie modernen Komfort in dieser stilvollen Wohnung mit luxuriösem Boxspringbett und gemütlichem Wohnbereich. Die voll ausgestattete Küche und der Smart-TV sorgen dafür, dass es Ihnen an nichts fehlt. Die zentrale, aber ruhige Lage macht dieses Apartment besonders.",
    highlight: "Nur wenige Schritte von der Weser und Bremens schönsten Highlights entfernt — Ihre City-Oase erwartet Sie.",
  },
  "city-apartment-no5": {
    headline: "Komfort trifft Zentralität",
    mood: "Ein modernes Apartment mit Kingsize-Bett und durchdachtem Design am Rembertiring. Nur wenige Schritte zum Hauptbahnhof! Hier finden Geschäftsreisende den perfekten Arbeitsplatz und Urlauber die ideale Basis für Bremen-Erkundungen. Voll ausgestattete Küche und Smart-TV inklusive.",
    highlight: "Wenige Schritte zum Bahnhof — die perfekte Verbindung aus Komfort und zentraler Lage.",
  },
  "schlachte-studio-no4": {
    headline: "Leben an der Weserpromenade",
    mood: "Direkt an der Schlachte gelegen, bietet dieses charmante Studio alles für einen unvergesslichen Aufenthalt. Eine komplett ausgestattete Küche, ein gemütliches Kingsize-Bett und ein kleiner Balkon laden zum Entspannen ein. Die Espressomaschine sorgt für den perfekten Start in den Tag.",
    highlight: "Treten Sie vor die Tür und genießen Sie die malerische Weserpromenade mit ihren Restaurants, Cafés und dem Flussblick.",
  },
  "schlachte-studio-no5": {
    headline: "Gemütlichkeit an der Schlachte",
    mood: "Unser Studio an der beliebten Schlachte-Promenade ist der ideale Ausgangspunkt für Ihre Bremen-Erkundung. Genießen Sie die unmittelbare Nähe zur Weser und das vielfältige Angebot an Restaurants und Cafés direkt vor der Haustür.",
    highlight: "Spaziergänge entlang der Weser am Abend, das Rauschen des Flusses — hier wird jeder Aufenthalt zum Erlebnis.",
  },
};

// Smoobu iframe URLs — all apartments use same booking tool
const smoobuIframeUrls: Record<string, string> = {
  "stadtwohnung-nr-2": "https://login.smoobu.com/de/booking-tool/iframe/800140",
  "city-apartment-no3": "https://login.smoobu.com/de/booking-tool/iframe/800140",
  "city-apartment-nr-4": "https://login.smoobu.com/de/booking-tool/iframe/800140",
  "city-apartment-no5": "https://login.smoobu.com/de/booking-tool/iframe/800140",
  "schlachte-studio-no4": "https://login.smoobu.com/de/booking-tool/iframe/800140",
  "schlachte-studio-no5": "https://login.smoobu.com/de/booking-tool/iframe/800140",
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const RoomDetail = () => {
  const { id } = useParams();
  const { data: dbRoom, isLoading } = useRoom(id);
  const staticRoom = staticRooms.find((r) => r.id === id);
  const contentRef = useRef<HTMLDivElement>(null);

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
        allImages: dbRoom.all_images ?? [],
        location: dbRoom.location ?? "",
      }
    : staticRoom
    ? { ...staticRoom, dbId: staticRoom.id, allImages: [staticRoom.image], location: "" }
    : null;

  const atmosphere = atmosphereTexts[id ?? ""] ?? atmosphereTexts["stadtwohnung-nr-2"];
  const smoobuIframeUrl = smoobuIframeUrls[id ?? ""];

  const galleryImages = room
    ? room.allImages.length > 0
      ? room.allImages
      : [room.image]
    : [];

  if (isLoading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <Loader2 className="animate-spin text-accent" size={40} />
        </motion.div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-4xl mb-4">Zimmer nicht gefunden</h1>
          <Link to="/zimmer">
            <Button variant="hero">Zurück zur Übersicht</Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-28 md:pt-32 bg-background overflow-hidden">
      {/* Breadcrumb with fade */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-3"
      >
        <Breadcrumbs items={[
          { label: "Zimmer", to: "/zimmer" },
          { label: room.title },
        ]} />
      </motion.div>

      {/* Gallery with scale entrance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto px-4 mb-12"
      >
        <RoomGallery images={galleryImages} title={room.title} />
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20" ref={contentRef}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-0">

            {/* Hero Title Section */}
            <motion.section
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-14"
            >
              <motion.div variants={fadeUp} custom={0} className="mb-2">
                <span className="inline-block text-[10px] font-body uppercase tracking-[0.35em] text-accent font-semibold mb-3">
                  {room.location || "Bremen"}
                </span>
              </motion.div>
              
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-display text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-foreground leading-[1.1] mb-5"
              >
                {room.title}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="font-body text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8"
              >
                {room.description}
              </motion.p>

              {/* Quick info badges */}
              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
                {[
                  { icon: MapPin, label: room.location || "Zentrale Lage" },
                  { icon: Users, label: `Bis zu ${room.guests} Gäste` },
                  { icon: Maximize2, label: room.size },
                  { icon: Shield, label: "Kostenlose Stornierung" },
                  { icon: Clock, label: "Selbst-Check-in" },
                ].filter(b => b.label).map((badge, i) => (
                  <motion.span
                    key={badge.label}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="bg-accent/8 text-accent border border-accent/15 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-body font-medium cursor-default"
                  >
                    <badge.icon size={13} />
                    {badge.label}
                  </motion.span>
                ))}
              </motion.div>
            </motion.section>

            {/* Elegant divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent origin-left mb-14"
            />

            {/* Atmosphere Section — cinematic */}
            <motion.section
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="mb-14"
            >
              <motion.span
                variants={fadeUp}
                className="text-[10px] font-body uppercase tracking-[0.35em] text-accent font-semibold block mb-4"
              >
                Das Erlebnis
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="font-display text-3xl md:text-4xl font-bold mb-6 text-foreground"
              >
                {atmosphere.headline}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="font-body text-muted-foreground leading-[1.8] text-base max-w-2xl mb-8"
              >
                {atmosphere.mood}
              </motion.p>
              <motion.div
                variants={scaleIn}
                className="relative bg-gradient-to-br from-accent/5 via-accent/8 to-accent/3 border border-accent/15 rounded-2xl p-7 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                <p className="font-display text-base italic text-foreground/80 leading-relaxed relative z-10">
                  „{atmosphere.highlight}"
                </p>
              </motion.div>
            </motion.section>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent origin-left mb-14"
            />

            {/* Detailed Description */}
            <motion.section
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="mb-14"
            >
              <motion.span
                variants={fadeUp}
                className="text-[10px] font-body uppercase tracking-[0.35em] text-accent font-semibold block mb-4"
              >
                Im Detail
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="font-display text-3xl md:text-4xl font-bold mb-6"
              >
                Über dieses Apartment
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="font-body text-muted-foreground leading-[1.8] text-base max-w-2xl"
              >
                {room.longDescription}
              </motion.p>
            </motion.section>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent origin-left mb-14"
            />

            {/* Amenity Groups */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="mb-14"
            >
              <motion.span
                variants={fadeUp}
                className="text-[10px] font-body uppercase tracking-[0.35em] text-accent font-semibold block mb-4"
              >
                Ausstattung
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="font-display text-3xl md:text-4xl font-bold mb-8"
              >
                Alles was Sie brauchen
              </motion.h2>
              <motion.div variants={fadeUp} custom={2}>
                <AmenityGroups amenities={room.amenities} />
              </motion.div>
            </motion.section>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent origin-left mb-14"
            />

            {/* House Rules — premium cards */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="mb-14"
            >
              <motion.span
                variants={fadeUp}
                className="text-[10px] font-body uppercase tracking-[0.35em] text-accent font-semibold block mb-4"
              >
                Wissenswertes
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="font-display text-3xl md:text-4xl font-bold mb-8"
              >
                Gut zu wissen
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Check-in", value: "Ab 15:00 Uhr", icon: Clock },
                  { label: "Check-out", value: "Bis 11:00 Uhr", icon: Clock },
                  { label: "Stornierung", value: "Kostenlos bis 24h vorher", icon: Shield },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    variants={fadeUp}
                    custom={i + 2}
                    whileHover={{ y: -4, boxShadow: "0 12px 40px -12px hsl(var(--accent) / 0.15)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-card border border-border rounded-2xl p-6 group cursor-default"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <item.icon size={18} className="text-accent" />
                    </div>
                    <p className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-display text-base font-semibold">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent origin-left mb-14"
            />

            {/* Reviews */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              <motion.span
                variants={fadeUp}
                className="text-[10px] font-body uppercase tracking-[0.35em] text-accent font-semibold block mb-4"
              >
                Erfahrungen
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="font-display text-3xl md:text-4xl font-bold mb-8"
              >
                Was unsere Gäste sagen
              </motion.h2>
              <motion.div variants={fadeUp} custom={2}>
                <GuestReviews />
              </motion.div>
            </motion.section>
          </div>

          {/* Right Sticky Booking Widget */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <StickyBookingWidget
                roomId={room.dbId}
                roomTitle={room.title}
                pricePerNight={room.price}
                maxGuests={room.guests}
                size={room.size}
                smoobuIframeUrl={smoobuIframeUrl}
              />
            </div>
          </div>
        </div>

        {/* Mobile fixed booking bar */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-40 flex items-center justify-between"
        >
          <div>
            <span className="font-display text-2xl font-bold">€{room.price}</span>
            <span className="text-sm font-body text-muted-foreground"> / Nacht</span>
          </div>
          <Button variant="hero" size="lg" asChild>
            <a href="#booking-mobile">Jetzt buchen</a>
          </Button>
        </motion.div>

        {/* Mobile booking form */}
        <div id="booking-mobile" className="lg:hidden mt-16">
          <StickyBookingWidget
            roomId={room.dbId}
            roomTitle={room.title}
            pricePerNight={room.price}
            maxGuests={room.guests}
            size={room.size}
            smoobuIframeUrl={smoobuIframeUrl}
          />
        </div>
      </div>
    </main>
  );
};

export default RoomDetail;
