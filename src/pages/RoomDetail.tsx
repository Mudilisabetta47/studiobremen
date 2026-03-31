import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Shield, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomGallery from "@/components/RoomGallery";
import AmenityGroups from "@/components/AmenityGroups";
import GuestReviews from "@/components/GuestReviews";
import StickyBookingWidget from "@/components/StickyBookingWidget";
import { useRoom } from "@/hooks/useRooms";
import { rooms as staticRooms } from "@/data/rooms";

// Atmospheric descriptions per room type
const atmosphereTexts: Record<string, { headline: string; mood: string; highlight: string }> = {
  "deluxe-zimmer": {
    headline: "Wo Eleganz auf Geborgenheit trifft",
    mood: "Tauchen Sie ein in eine Atmosphäre zeitloser Raffinesse. Warme Erdtöne, weiche Stoffe und gedämpftes Licht schaffen einen Rückzugsort, der zum Verweilen einlädt. Das sanfte Spiel von Licht und Schatten durch die bodentiefen Fenster verwandelt jeden Moment in ein Erlebnis.",
    highlight: "Erwachen Sie mit dem goldenen Morgenlicht über den Dächern der Altstadt — ein Anblick, der jeden Tag besonders macht.",
  },
  "premium-suite": {
    headline: "Grandeur trifft auf Intimität",
    mood: "Die Premium Suite ist mehr als ein Zimmer — sie ist ein Versprechen. Marmor und edles Holz, durchdacht bis ins kleinste Detail. Hier verschmilzt die Großzügigkeit eines Salons mit der Wärme eines privaten Refugiums. Jeder Quadratmeter atmet Luxus.",
    highlight: "Genießen Sie ein Bad in der freistehenden Wanne mit Blick auf die illuminierte Stadt — Ihr persönlicher Moment der Stille.",
  },
  "city-apartment": {
    headline: "Ihr Zuhause in der Ferne",
    mood: "Modern, durchdacht und voller Charakter — unser City Apartment verbindet die Freiheit einer eigenen Wohnung mit dem Komfort eines modernen Apartments. Helle Räume, klare Linien und natürliche Materialien schaffen eine Atmosphäre, die sofort vertraut wirkt.",
    highlight: "Kochen Sie mit frischen Zutaten vom Markt und genießen Sie Ihren Kaffee am Fenster mit Blick auf das geschäftige Treiben der Stadt.",
  },
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

// Smoobu iframe URLs per room slug
const smoobuIframeUrls: Record<string, string> = {
  "stadtwohnung-nr-2": "https://login.smoobu.com/de/booking-tool/iframe/800140",
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
      }
    : staticRoom
    ? { ...staticRoom, dbId: staticRoom.id, allImages: [staticRoom.image] }
    : null;

  const atmosphere = atmosphereTexts[id ?? ""] ?? atmosphereTexts["deluxe-zimmer"];
  const smoobuIframeUrl = smoobuIframeUrls[id ?? ""];

  // Use all DB images for gallery, fallback to primary image repeated
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
    <main className="pt-20">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm font-body text-muted-foreground">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <Link to="/zimmer" className="hover:text-accent transition-colors">Zimmer</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{room.title}</span>
        </nav>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-4 mb-10">
        <RoomGallery images={galleryImages} title={room.title} />
      </div>

      {/* Main Content + Sticky Widget */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Title & Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                {room.title}
              </h1>
              <p className="font-body text-muted-foreground mb-5">{room.description}</p>

              {/* Quick badges */}
              <div className="flex flex-wrap gap-3 text-xs font-body">
                <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <MapPin size={12} /> Zentrale Lage
                </span>
                <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Shield size={12} /> Kostenlose Stornierung
                </span>
                <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Clock size={12} /> Check-in ab 15:00
                </span>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Atmosphere Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-display text-2xl font-semibold mb-2 text-foreground">
                {atmosphere.headline}
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                {atmosphere.mood}
              </p>
              <div className="bg-accent/5 border-l-4 border-accent rounded-r-lg p-5">
                <p className="font-body text-sm italic text-foreground/80 leading-relaxed">
                  {atmosphere.highlight}
                </p>
              </div>
            </motion.div>

            {/* Detailed Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-display text-2xl font-semibold mb-4">Über dieses Zimmer</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                {room.longDescription}
              </p>
            </motion.div>

            <div className="border-t border-border" />

            {/* Amenity Groups */}
            <div>
              <h2 className="font-display text-2xl font-semibold mb-6">Ausstattung & Annehmlichkeiten</h2>
              <AmenityGroups amenities={room.amenities} />
            </div>

            <div className="border-t border-border" />

            {/* House Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-display text-2xl font-semibold mb-4">Gut zu wissen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Check-in", value: "Ab 15:00 Uhr" },
                  { label: "Check-out", value: "Bis 11:00 Uhr" },
                  { label: "Stornierung", value: "Kostenlos bis 24h vorher" },
                ].map((item) => (
                  <div key={item.label} className="bg-card border border-border rounded-lg p-4">
                    <p className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-display text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="border-t border-border" />

            {/* Reviews */}
            <div>
              <h2 className="font-display text-2xl font-semibold mb-6">Gästebewertungen</h2>
              <GuestReviews />
            </div>
          </div>

          {/* Right Sticky Booking Widget */}
          <div className="hidden lg:block">
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

        {/* Mobile fixed booking bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40 flex items-center justify-between">
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
          />
        </div>
      </div>
    </main>
  );
};

export default RoomDetail;
