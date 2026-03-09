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
    name: "Anna K.",
    date: "Februar 2026",
    rating: 5,
    text: "Ein wunderbarer Aufenthalt! Das Zimmer war makellos, das Personal herzlich und das Frühstück ein Traum. Man spürt die Liebe zum Detail überall.",
    country: "Schweiz",
  },
  {
    name: "Thomas M.",
    date: "Januar 2026",
    rating: 5,
    text: "Perfekte Lage, erstklassiger Service. Die Bettwäsche war unglaublich weich und der Blick auf die Stadt atemberaubend. Komme definitiv wieder.",
    country: "Deutschland",
  },
  {
    name: "Sophie L.",
    date: "Dezember 2025",
    rating: 4,
    text: "Sehr schönes Boutique-Hotel mit viel Charme. Die Atmosphäre ist ruhig und elegant. Ideal für einen Wochenend-Trip.",
    country: "Österreich",
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
