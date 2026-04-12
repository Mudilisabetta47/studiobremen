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
  ArrowRight, Key, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hotel.jpg";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
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
    <main className="bg-background">
      {/* ═══ HERO ═══ */}
      <HeroSection />

      {/* ═══ BOOKING WIDGET ═══ */}
      <section className="container mx-auto px-4 -mt-8 relative z-20 mb-16">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8">
          <BookingWidget />
        </div>
      </section>

      {/* ═══ USPs ═══ */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { icon: Key, title: "Selbst-Check-in", desc: "Flexibel & kontaktlos" },
              { icon: MapPin, title: "Zentrale Lage", desc: "Top-Standorte in Bremen" },
              { icon: Wifi, title: "Kostenloses WLAN", desc: "Highspeed in allen Apartments" },
              { icon: CheckCircle2, title: "Kostenlos stornierbar", desc: "Bis 24h vor Anreise" },
            ].map((usp, i) => (
              <motion.div
                key={usp.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <usp.icon size={22} className="text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">{usp.title}</p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">{usp.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ APARTMENTS ═══ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fade} className="flex items-end justify-between mb-10">
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">Entdecken</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Unsere Apartments
              </h2>
            </div>
            <Link to="/zimmer" className="hidden md:block">
              <Button variant="ghost" className="text-accent hover:text-accent/80 gap-1 text-sm font-medium">
                Alle anzeigen <ArrowRight size={14} />
              </Button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-accent" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRooms.map((room, index) => (
                <RoomCard key={room.id} {...room} index={index} />
              ))}
            </div>
          )}

          <motion.div {...fade} className="text-center mt-10 md:hidden">
            <Link to="/zimmer">
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 h-11 gap-2 text-sm">
                Alle Apartments <ArrowRight size={14} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <motion.div {...fade} className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src={heroImage}
                alt="Stilvolles Apartment in Bremen"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Rating badge */}
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                <span className="font-body text-sm font-semibold text-foreground">4.9</span>
                <span className="font-body text-xs text-muted-foreground">· 500+ Gäste</span>
              </div>
            </motion.div>

            {/* Text */}
            <div>
              <motion.div {...fade}>
                <p className="font-body text-xs text-muted-foreground mb-1">Über uns</p>
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-tight mb-6">
                  Norddeutsche Gastfreundschaft,{" "}
                  <span className="text-accent">modern interpretiert</span>
                </h2>
                <p className="font-body text-muted-foreground leading-relaxed text-[15px] mb-4 max-w-lg">
                  Seit 2020 verbinden wir modernen Komfort mit der Herzlichkeit Bremens.
                  Jedes Apartment erzählt eine eigene Geschichte – von hanseatischer Tradition
                  bis zu zeitgenössischem Design.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed text-[15px] mb-10 max-w-lg">
                  Ob Geschäftsreise oder Wochenend-Trip – bei uns fühlen Sie sich
                  nicht nur willkommen, sondern zuhause.
                </p>
              </motion.div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-5">
                {[
                  { icon: MapPin, label: "2 Standorte", desc: "In bester Lage" },
                  { icon: Coffee, label: "Voll ausgestattet", desc: "Küche, Kaffee & mehr" },
                  { icon: Wifi, label: "Highspeed WLAN", desc: "Kostenfrei" },
                  { icon: ShieldCheck, label: "Superhost", desc: "Airbnb verifiziert" },
                ].map((feat, i) => (
                  <motion.div
                    key={feat.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <feat.icon size={16} className="text-accent" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{feat.label}</p>
                      <p className="font-body text-xs text-muted-foreground">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto text-center">
            {[
              { stat: "Superhost", desc: "Airbnb Auszeichnung" },
              { stat: "500+", desc: "Zufriedene Gäste" },
              { stat: "4.9", desc: "Ø Bewertung" },
            ].map((item, i) => (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-1">{item.stat}</p>
                <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fade} className="flex items-end justify-between mb-10">
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">Gästestimmen</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Was unsere Gäste sagen
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="text-accent fill-accent" />
                ))}
              </div>
              <span className="font-body text-sm font-medium text-foreground">4.9</span>
            </div>
          </motion.div>

          <GuestReviews />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fade} className="text-center max-w-lg mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Bereit für Bremen?
            </h2>
            <p className="font-body text-muted-foreground text-sm mb-4 leading-relaxed">
              Voll ausgestattete Apartments ab €49 pro Nacht – zentral, modern, flexibel.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground font-body mb-8">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-accent" /> Kostenlose Stornierung
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-accent" /> Selbst-Check-in
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-accent" /> WLAN inklusive
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/zimmer">
                <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 h-12 text-sm font-medium">
                  Jetzt buchen
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button variant="outline" className="rounded-xl px-8 h-12 text-sm font-medium border-border hover:bg-secondary">
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
