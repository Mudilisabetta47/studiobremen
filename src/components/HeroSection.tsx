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

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0.45, 0.8]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[650px] flex items-end overflow-hidden">
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
        className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"
        style={{ opacity: overlayOpacity }}
      />

      {/* Decorative gold line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-gold z-10" />

      {/* Content – bottom-aligned, editorial layout */}
      <motion.div
        className="relative z-10 w-full"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="container mx-auto px-4 pb-28 lg:pb-32">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="w-12 h-[1px] bg-accent" />
              <span className="font-body text-accent text-[11px] tracking-[0.35em] uppercase font-semibold">
                Apartments · Bremen
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-[0.95] mb-6"
            >
              Wo Gemütlichkeit
              <br />
              <span className="italic font-normal text-accent">zuhause</span> ist
            </motion.h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="font-body text-primary-foreground/70 text-base md:text-lg max-w-md mb-10 leading-relaxed"
            >
              Erstklassiger Komfort und norddeutsche Gastfreundschaft – 
              im Herzen der Hansestadt.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/zimmer">
                <Button variant="hero" size="lg" className="px-10">
                  Zimmer entdecken
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button variant="hero-outline" size="lg" className="px-10">
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
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-9 border border-primary-foreground/30 rounded-full flex items-start justify-center pt-2"
        >
          <div className="w-1 h-1.5 bg-accent rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
