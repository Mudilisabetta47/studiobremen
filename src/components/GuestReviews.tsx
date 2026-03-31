import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Review {
  name: string;
  date: string;
  rating: number;
  text: string;
  country: string;
}

const staticReviews: Review[] = [
  {
    name: "Marco S.",
    date: "März 2026",
    rating: 5,
    text: "Super Lage, alles sauber und modern eingerichtet. Der Selbst-Check-in hat reibungslos funktioniert. Kaffee und Wasser waren schon da – sehr aufmerksam! Komme gerne wieder.",
    country: "Deutschland",
  },
  {
    name: "Lisa & Jan",
    date: "Februar 2026",
    rating: 5,
    text: "Perfekt für unseren Städtetrip! Die Wohnung war genau wie auf den Bildern, super zentral und wirklich gemütlich. Die Küche hat alles was man braucht.",
    country: "Deutschland",
  },
  {
    name: "Émilie R.",
    date: "Januar 2026",
    rating: 5,
    text: "Très bel appartement, propre et bien situé. La communication était excellente et le check-in très facile. Je recommande vivement!",
    country: "Frankreich",
  },
  {
    name: "Andreas W.",
    date: "Dezember 2025",
    rating: 5,
    text: "Ich bin beruflich oft in Bremen und buche immer hier. Schnelles WLAN, ruhige Lage trotz Zentrum und ein bequemes Bett. Top Preis-Leistung!",
    country: "Deutschland",
  },
  {
    name: "Sarah K.",
    date: "November 2025",
    rating: 5,
    text: "Die Schlachte-Wohnung ist ein Traum! Direkt an der Weser, super Restaurants in der Nähe. Die Espressomaschine war das Highlight am Morgen.",
    country: "Österreich",
  },
  {
    name: "Tom B.",
    date: "Oktober 2025",
    rating: 4,
    text: "Sehr gute Unterkunft, sauber und modern. Lage direkt am Bahnhof ist ideal. Einziger Wunsch: ein zweites Kopfkissen wäre super gewesen.",
    country: "Niederlande",
  },
];

const GuestReviews = () => {
  const avgRating = (staticReviews.reduce((s, r) => s + r.rating, 0) / staticReviews.length).toFixed(1);

  return (
    <section>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-accent text-accent-foreground font-display text-2xl font-bold rounded-lg w-14 h-14 flex items-center justify-center">
          {avgRating}
        </div>
        <div>
          <p className="font-display text-lg font-semibold">Hervorragend</p>
          <p className="text-sm font-body text-muted-foreground">{staticReviews.length} Bewertungen</p>
        </div>
        <div className="flex gap-0.5 ml-auto">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={18} className={s <= Math.round(Number(avgRating)) ? "text-accent fill-accent" : "text-muted"} />
          ))}
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {staticReviews.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-card border border-border rounded-lg p-5 relative"
          >
            <Quote size={24} className="text-accent/20 absolute top-4 right-4" />
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={s <= review.rating ? "text-accent fill-accent" : "text-muted"} />
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
              "{review.text}"
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm font-medium text-foreground">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.country}</p>
              </div>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GuestReviews;
