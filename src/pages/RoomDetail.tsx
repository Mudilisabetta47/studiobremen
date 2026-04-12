import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Shield, Clock, Loader2, Users, Maximize2, Star, DoorOpen } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import RoomGallery from "@/components/RoomGallery";
import AmenityGroups from "@/components/AmenityGroups";
import GuestReviews from "@/components/GuestReviews";
import StickyBookingWidget from "@/components/StickyBookingWidget";
import { useRoom } from "@/hooks/useRooms";
import { rooms as staticRooms } from "@/data/rooms";

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

const RoomDetail = () => {
  const { id } = useParams();
  const { data: dbRoom, isLoading } = useRoom(id);
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
    <main className="pt-24 md:pt-28 bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl pt-2 mb-4">
        <Breadcrumbs items={[
          { label: "Zimmer", to: "/zimmer" },
          { label: room.title },
        ]} />
      </div>

      {/* Title section — Airbnb style: title above gallery */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-display text-2xl md:text-3xl font-bold text-foreground"
        >
          {room.title}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mt-2 text-sm font-body text-muted-foreground"
        >
          <div className="flex items-center gap-1">
            <Star size={14} className="text-accent fill-accent" />
            <span className="font-medium text-foreground">4.7</span>
          </div>
          <span>·</span>
          <span>6 Bewertungen</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {room.location || "Bremen"}
          </span>
        </motion.div>
      </div>

      {/* Gallery — full width within container */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl mb-10">
        <RoomGallery images={galleryImages} title={room.title} />
      </div>

      {/* Two-column layout: Content left, Booking right */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* ─── Left column: all content ─── */}
          <div className="flex-1 min-w-0">

            {/* Host info / quick overview row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex items-start justify-between pb-8 border-b border-border"
            >
              <div>
                <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1">
                  {room.size} · Gastgeber: Studio Bremen
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm font-body text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users size={15} /> {room.guests} Gäste
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize2 size={15} /> {room.size}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DoorOpen size={15} /> Selbst-Check-in
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex w-14 h-14 rounded-full bg-primary text-primary-foreground items-center justify-center font-display font-bold text-lg shrink-0">
                SB
              </div>
            </motion.div>

            {/* Highlights row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="py-8 border-b border-border space-y-5"
            >
              {[
                { icon: DoorOpen, title: "Selbst-Check-in", desc: "Einfacher Zugang mit dem Smart Lock." },
                { icon: MapPin, title: "Tolle Lage", desc: "95 % der Gäste haben die Lage mit 5 Sternen bewertet." },
                { icon: Shield, title: "Kostenlose Stornierung", desc: "Bis 24 Stunden vor Check-in kostenlos stornierbar." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-body text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="py-8 border-b border-border"
            >
              <p className="font-body text-base text-foreground leading-7 mb-4">
                {room.description}
              </p>
              <p className="font-body text-base text-muted-foreground leading-7">
                {room.longDescription}
              </p>
            </motion.div>

            {/* Atmosphere quote */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="py-8 border-b border-border"
            >
              <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-4">
                {atmosphere.headline}
              </h2>
              <p className="font-body text-base text-muted-foreground leading-7 mb-5">
                {atmosphere.mood}
              </p>
              <div className="bg-accent/5 border-l-4 border-accent rounded-r-lg p-5">
                <p className="font-body text-sm italic text-foreground/80 leading-relaxed">
                  {atmosphere.highlight}
                </p>
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="py-8 border-b border-border"
            >
              <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-6">
                Was diese Unterkunft bietet
              </h2>
              <AmenityGroups amenities={room.amenities} />
            </motion.div>

            {/* House Rules */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="py-8 border-b border-border"
            >
              <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-6">
                Gut zu wissen
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Check-in", value: "Ab 15:00 Uhr", icon: Clock },
                  { label: "Check-out", value: "Bis 11:00 Uhr", icon: Clock },
                  { label: "Stornierung", value: "Kostenlos bis 24h vorher", icon: Shield },
                ].map((item) => (
                  <div key={item.label} className="bg-card border border-border rounded-xl p-5">
                    <item.icon size={20} className="text-accent mb-3" />
                    <p className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-body text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="py-8"
            >
              <GuestReviews />
            </motion.div>
          </div>

          {/* ─── Right column: sticky booking widget ─── */}
          <div className="hidden lg:block lg:w-[380px] xl:w-[420px] shrink-0">
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-40 flex items-center justify-between">
          <div>
            <span className="font-display text-xl font-bold">€{room.price}</span>
            <span className="text-sm font-body text-muted-foreground"> / Nacht</span>
          </div>
          <Button variant="hero" size="lg" asChild>
            <a href="#booking-mobile">Jetzt buchen</a>
          </Button>
        </div>

        {/* Mobile booking form */}
        <div id="booking-mobile" className="lg:hidden mt-12">
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
