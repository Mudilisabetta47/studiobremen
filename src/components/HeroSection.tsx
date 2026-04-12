import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import heroImage from "@/assets/hero-hotel.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-background">
      {/* Full-width hero image */}
      <div className="relative w-full h-[70vh] min-h-[500px] max-h-[720px] overflow-hidden">
        <motion.img
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          src={heroImage}
          alt="Hotel Bremen – Boutique Apartments im Herzen Bremens"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Subtle bottom gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Text overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 pb-16 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-4">
                Wo Gemütlichkeit
                <br />
                <span className="italic font-normal">zuhause</span> ist
              </h1>
              <p className="font-body text-white/80 text-base md:text-lg max-w-md mb-6">
                Voll ausgestattete Apartments in bester Lage – 
                Ihr Zuhause in Bremen.
              </p>
              <Link to="/zimmer">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-8 h-12 text-sm font-medium gap-2">
                  <Search size={16} />
                  Apartments entdecken
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
