import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import BookingWidget from "@/components/BookingWidget";
import RoomCard from "@/components/RoomCard";
import GuestReviews from "@/components/GuestReviews";
import { useRooms } from "@/hooks/useRooms";
import { rooms as staticRooms } from "@/data/rooms";
import {
  Star, Loader2, MapPin, Coffee, Wifi, ShieldCheck,
  ArrowRight, Key, Heart, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hotel.jpg";
import roomSuite from "@/assets/room-suite.jpg";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 },
};

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
        location: r.location ?? "",
      }))
    : staticRooms;

  return (
    <main>
      {/* ═══ HERO ═══ */}
      <HeroSection />

      {/* ═══ BOOKING WIDGET ═══ */}
      <section className="container mx-auto px-4 -mt-14 relative z-20">
        <BookingWidget />
      </section>

      {/* ═══ USPs ═══ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { icon: Key, title: "Selbst-Check-in", desc: "Flexibel & kontaktlos" },
              { icon: MapPin, title: "Zentrale Lage", desc: "5 Min. zum Hauptbahnhof" },
              { icon: Wifi, title: "Kostenloses WLAN", desc: "Highspeed überall" },
              { icon: CheckCircle2, title: "Kostenlos stornierbar", desc: "Bis 24h vor Anreise" },
            ].map((usp, i) => (
              <motion.div
                key={usp.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="text-center"
              >
                <usp.icon size={20} className="text-accent mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-display text-sm font-semibold text-foreground tracking-wide">{usp.title}</p>
                <p className="font-body text-[11px] text-muted-foreground mt-1">{usp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT / STORY ═══ */}
      <section className="py-28 lg:py-40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28 items-center">
            {/* Image side */}
            <motion.div {...fade} className="relative">
              <div className="relative overflow-hidden aspect-[3/4]">
                <img
                  src={roomSuite}
                  alt="Stilvolles Apartment in Bremen"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating accent */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-8 -right-4 lg:-right-10 bg-primary p-6"
              >
                <p className="font-display text-3xl font-bold text-accent">4.9</p>
                <p className="font-body text-[10px] text-primary-foreground/50 tracking-wider uppercase mt-1">Rating</p>
              </motion.div>
            </motion.div>

            {/* Text side */}
            <div>
              <motion.div {...fade}>
                <span className="font-body text-[10px] tracking-[0.4em] uppercase text-accent font-medium">
                  Über uns
                </span>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-[1.1] mt-4 mb-8">
                  Norddeutsche
                  <br />
                  <span className="italic font-normal text-accent">Gastfreundschaft</span>
                </h2>
                <p className="font-body text-muted-foreground leading-relaxed text-[15px] mb-5 max-w-md">
                  Seit 2020 verbinden wir modernen Komfort mit der Herzlichkeit Bremens.
                  Jedes Apartment erzählt eine eigene Geschichte – von hanseatischer Tradition
                  bis zu zeitgenössischem Design.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed text-[15px] mb-12 max-w-md">
                  Ob Geschäftsreise oder Wochenend-Trip – bei uns fühlen Sie sich
                  nicht nur willkommen, sondern zuhause.
                </p>
              </motion.div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: MapPin, label: "Zentrale Lage", desc: "2 Standorte in Bremen" },
                  { icon: Coffee, label: "Voll ausgestattet", desc: "Küche, Kaffee & Tee" },
                  { icon: Wifi, label: "Highspeed WLAN", desc: "Kostenfrei" },
                  { icon: ShieldCheck, label: "Superhost", desc: "Airbnb verifiziert" },
                ].map((feat, i) => (
                  <motion.div
                    key={feat.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <feat.icon size={16} className="text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{feat.label}</p>
                      <p className="font-body text-[11px] text-muted-foreground">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ROOMS ═══ */}
      <section className="bg-primary py-28 lg:py-40">
        <div className="container mx-auto px-4">
          <motion.div {...fade} className="text-center mb-20">
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-accent font-medium">
              Unterkünfte
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground mt-4 mb-5">
              Unsere Apartments
            </h2>
            <p className="font-body text-primary-foreground/50 max-w-sm mx-auto text-sm leading-relaxed">
              Einzigartige Apartments an Top-Standorten in Bremen – ab €49 pro Nacht.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-accent" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {displayRooms.map((room, index) => (
                <RoomCard key={room.id} {...room} index={index} />
              ))}
            </div>
          )}

          <motion.div {...fade} className="text-center mt-16">
            <Link to="/zimmer">
              <Button variant="hero" size="lg" className="gap-2 px-12">
                Alle Apartments <ArrowRight size={14} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {[
              { stat: "Superhost", desc: "Airbnb Auszeichnung" },
              { stat: "500+", desc: "Zufriedene Gäste" },
              { stat: "4.9 / 5", desc: "Bewertung" },
            ].map((item, i) => (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <p className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-1">{item.stat}</p>
                <p className="font-body text-[11px] text-muted-foreground tracking-wide">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HIGHLIGHT BANNER ═══ */}
      <section className="relative py-32 lg:py-44 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fade} className="text-center max-w-lg mx-auto">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-6 leading-[1.1]">
              Ihr Zuhause in
              <br />
              <span className="italic font-normal text-accent">Bremen</span>
            </h2>
            <p className="font-body text-primary-foreground/50 text-sm mb-10 leading-relaxed">
              Von der handverlesenen Bettwäsche bis zum perfekt gebrühten Kaffee – 
              bei uns ist nichts dem Zufall überlassen.
            </p>
            <Link to="/zimmer">
              <Button variant="hero" size="lg" className="px-12">
                Verfügbarkeit prüfen
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-28 lg:py-40">
        <div className="container mx-auto px-4">
          <motion.div {...fade} className="mb-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <span className="font-body text-[10px] tracking-[0.4em] uppercase text-accent font-medium">
                  Gästestimmen
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mt-3">
                  Was unsere Gäste sagen
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                <span className="font-body text-xs text-muted-foreground">4.9 / 5</span>
              </div>
            </div>
          </motion.div>

          <GuestReviews />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-primary py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fade} className="text-center max-w-md mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground mb-4">
              Bereit für Bremen?
            </h2>
            <p className="font-body text-primary-foreground/50 text-sm mb-4 leading-relaxed">
              Ab €49 pro Nacht – zentral, modern, flexibel.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-primary-foreground/40 font-body tracking-wider uppercase mb-10">
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-accent/60" /> Kostenlose Stornierung</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-accent/60" /> Selbst-Check-in</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-accent/60" /> WLAN inklusive</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/zimmer">
                <Button variant="hero" size="lg" className="px-12">
                  Jetzt buchen
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button variant="hero-outline" size="lg" className="px-12">
                  Kontakt
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Index;
