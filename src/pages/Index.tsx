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
  ArrowRight, Sparkles, Clock, Key, BadgeCheck, Heart,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hotel.jpg";
import roomSuite from "@/assets/room-suite.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
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
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <BookingWidget />
      </section>

      {/* ═══ USPs / TRUST BAR ═══ */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Key, title: "Selbst-Check-in", desc: "Flexibel & kontaktlos" },
              { icon: MapPin, title: "Zentrale Lage", desc: "5 Min. zum Hauptbahnhof" },
              { icon: Wifi, title: "Kostenloses WLAN", desc: "Highspeed in jeder Wohnung" },
              { icon: CheckCircle2, title: "Kostenlos stornierbar", desc: "Bis 24h vor Anreise" },
            ].map((usp, i) => (
              <motion.div
                key={usp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <usp.icon size={20} className="text-accent" />
                </div>
                <p className="font-display text-sm font-semibold text-foreground">{usp.title}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">{usp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT / STORY ═══ */}
      <section className="py-28 lg:py-36 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image side */}
            <motion.div {...fadeUp} className="relative">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5] lg:aspect-[3/4]">
                <img
                  src={roomSuite}
                  alt="Stilvolles Apartment in Bremen – Studio Bremen"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 border-2 border-accent/20 rounded-2xl pointer-events-none" />
              </div>
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -bottom-6 -right-4 lg:-right-8 bg-primary text-primary-foreground rounded-xl p-5 shadow-2xl"
              >
                <p className="font-display text-3xl font-bold text-accent">4.9★</p>
                <p className="font-body text-xs text-primary-foreground/70 mt-0.5">Durchschnitt<br />bei Airbnb</p>
              </motion.div>
            </motion.div>

            {/* Text side */}
            <div>
              <motion.div {...fadeUp}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-[1px] bg-accent" />
                  <span className="font-body text-accent text-[11px] tracking-[0.3em] uppercase font-semibold">
                    Über uns
                  </span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                  Norddeutsche
                  <br />
                  <span className="italic font-normal text-accent">Gastfreundschaft</span>
                </h2>
                <p className="font-body text-muted-foreground leading-relaxed text-base mb-6 max-w-lg">
                  Seit 2020 verbinden wir modernen Komfort mit der Herzlichkeit Bremens.
                  Jedes Apartment erzählt eine eigene Geschichte – von hanseatischer Tradition
                  bis zu zeitgenössischem Design.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed text-base mb-10 max-w-lg">
                  Ob Geschäftsreise oder Wochenend-Trip – bei uns fühlen Sie sich
                  nicht nur willkommen, sondern zuhause.
                </p>
              </motion.div>

              {/* Feature pills */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: MapPin, label: "Zentrale Lage", desc: "2 Standorte in Bremen" },
                  { icon: Coffee, label: "Voll ausgestattet", desc: "Küche & Espresso" },
                  { icon: Wifi, label: "Highspeed WLAN", desc: "Kostenfrei" },
                  { icon: ShieldCheck, label: "Verifiziert", desc: "Superhost bei Airbnb" },
                ].map((feat, i) => (
                  <motion.div
                    key={feat.label}
                    {...stagger}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 group hover:border-accent/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <feat.icon size={16} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">{feat.label}</p>
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
      <section className="bg-gradient-hotel py-28 lg:py-36">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="w-10 h-[1px] bg-accent" />
              <span className="font-body text-accent text-[11px] tracking-[0.3em] uppercase font-semibold">
                Unterkünfte
              </span>
              <span className="w-10 h-[1px] bg-accent" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Unsere Apartments
            </h2>
            <p className="font-body text-primary-foreground/60 max-w-md mx-auto">
              6 einzigartige Apartments an 2 Top-Standorten in Bremen – ab €49 pro Nacht.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayRooms.map((room, index) => (
                <RoomCard key={room.id} {...room} index={index} />
              ))}
            </div>
          )}

          <motion.div {...fadeUp} className="text-center mt-14">
            <Link to="/zimmer">
              <Button variant="hero" size="lg" className="gap-2 px-10 shadow-lg hover:shadow-xl transition-shadow">
                Alle Apartments ansehen <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ TRUST ELEMENTS ═══ */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: BadgeCheck, stat: "Superhost", desc: "Ausgezeichnet bei Airbnb für herausragende Gastfreundschaft" },
              { icon: Heart, stat: "500+", desc: "Zufriedene Gäste aus aller Welt seit 2020" },
              { icon: Star, stat: "4.9 / 5", desc: "Durchschnittliche Bewertung über alle Apartments" },
            ].map((item, i) => (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-accent" />
                </div>
                <p className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">{item.stat}</p>
                <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HIGHLIGHT BANNER ═══ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
            <Sparkles size={28} className="text-accent mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Ihr Zuhause in
              <br />
              <span className="italic font-normal text-accent">Bremen</span>
            </h2>
            <p className="font-body text-primary-foreground/70 text-base mb-10 max-w-lg mx-auto leading-relaxed">
              Von der handverlesenen Bettwäsche bis zum perfekt gebrühten Kaffee – 
              bei uns ist nichts dem Zufall überlassen.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/zimmer">
                <Button variant="hero" size="lg" className="px-10 shadow-lg hover:shadow-xl transition-shadow">
                  Verfügbarkeit prüfen
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-28 lg:py-36">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-[1px] bg-accent" />
              <span className="font-body text-accent text-[11px] tracking-[0.3em] uppercase font-semibold">
                Gästestimmen
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Was unsere Gäste sagen
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className="text-accent fill-accent" />
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground">4.9 / 5 bei Airbnb</span>
              </div>
            </div>
          </motion.div>

          <GuestReviews />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-gradient-hotel py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Bereit für Ihren Aufenthalt in Bremen?
            </h2>
            <p className="font-body text-primary-foreground/70 mb-4">
              Ab €49 pro Nacht – zentral gelegen, modern ausgestattet, flexibel buchbar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-primary-foreground/60 font-body mb-8">
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-accent" /> Kostenlose Stornierung</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-accent" /> Selbst-Check-in</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-accent" /> WLAN inklusive</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/zimmer">
                <Button variant="hero" size="lg" className="px-10 shadow-lg hover:shadow-xl transition-shadow">
                  Jetzt Apartment buchen
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button variant="hero-outline" size="lg" className="px-10">
                  Kontakt aufnehmen
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
