import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hotel.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0.5, 0.85]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[700px] flex items-center overflow-hidden">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: imgY, scale: imgScale }}>
        <img
          src={heroImage}
          alt="Hotel Bremen – Boutique Hotel im Herzen Bremens"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/40 to-primary/80"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content – centered, editorial layout */}
      <motion.div
        className="relative z-10 w-full"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <span className="font-body text-accent text-[10px] tracking-[0.5em] uppercase font-medium">
                Apartments · Bremen
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-semibold text-primary-foreground leading-[1] mb-8 tracking-tight"
            >
              Wo Gemütlichkeit
              <br />
              <span className="italic font-normal text-accent">zuhause</span> ist
            </motion.h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="font-body text-primary-foreground/60 text-sm md:text-base max-w-md mx-auto mb-12 leading-relaxed tracking-wide"
            >
              Erstklassiger Komfort und norddeutsche Gastfreundschaft – 
              im Herzen der Hansestadt.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/zimmer">
                <Button variant="hero" size="lg" className="px-12">
                  Zimmer entdecken
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button variant="hero-outline" size="lg" className="px-12">
                  Kontakt
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="font-body text-[9px] tracking-[0.4em] uppercase text-primary-foreground/40">
            Scroll
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-accent/60 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
