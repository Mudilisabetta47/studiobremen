import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Startseite" },
  { to: "/zimmer", label: "Zimmer" },
  { to: "/kontakt", label: "Kontakt" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      {/* ── Top bar ── */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] overflow-hidden transition-all duration-500",
          scrolled ? "h-0 opacity-0" : "h-9 opacity-100",
        )}
      >
        <div className="bg-primary h-full border-b border-primary-foreground/5">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a href="tel:+49421123456" className="flex items-center gap-1.5 text-[11px] font-body text-primary-foreground/60 hover:text-accent transition-colors">
                <Phone size={11} className="text-accent/70" /> +49 421 123 456
              </a>
              <a href="mailto:info@hotel-bremen.de" className="hidden sm:flex items-center gap-1.5 text-[11px] font-body text-primary-foreground/60 hover:text-accent transition-colors">
                <Mail size={11} className="text-accent/70" /> info@hotel-bremen.de
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-body text-primary-foreground/60">
              <MapPin size={11} className="text-accent/70" />
              Bremen, Deutschland
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main header ── */}
      <header
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "top-0" : "top-9",
          scrolled
            ? "bg-primary/95 backdrop-blur-xl shadow-lg shadow-primary/20"
            : isHome
              ? "bg-transparent"
              : "bg-primary",
        )}
      >
        {/* Gold accent line */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}>
          <div className="h-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        </div>

        <div className="container mx-auto flex items-center justify-between h-[72px] px-4">
          {/* Logo */}
          <Link to="/" className="relative group">
            <span className="font-display text-xl font-bold text-primary-foreground tracking-[0.1em]">
              IHR ZUHAUSE IN
            </span>
            <span className="font-display text-xl font-bold text-accent tracking-[0.1em] ml-2">
              BREMEN
            </span>
            <span className={cn(
              "absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-300",
              "w-0 group-hover:w-full",
            )} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-5 py-2 group"
                >
                  <span className={cn(
                    "font-body text-[12px] tracking-[0.2em] uppercase transition-colors duration-300",
                    isActive ? "text-accent" : "text-primary-foreground/70 group-hover:text-primary-foreground",
                  )}>
                    {link.label}
                  </span>
                  <span className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-accent rounded-full transition-all duration-300",
                    isActive ? "w-6" : "w-0 group-hover:w-4",
                  )} />
                </Link>
              );
            })}

            {/* Divider */}
            <div className="w-[1px] h-5 bg-primary-foreground/15 mx-3" />

            <Link to="/zimmer">
              <Button variant="hero" size="sm" className="px-6 rounded-full text-[11px] tracking-[0.15em]">
                Jetzt buchen
              </Button>
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center text-primary-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden bg-primary border-t border-primary-foreground/10"
            >
              <nav className="flex flex-col items-center gap-2 py-8 px-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "font-body text-sm tracking-[0.2em] uppercase py-3 px-6 rounded-lg transition-colors",
                        location.pathname === link.to
                          ? "text-accent bg-accent/10"
                          : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5",
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2">
                  <Link to="/zimmer" onClick={() => setMobileOpen(false)}>
                    <Button variant="hero" className="rounded-full px-8 text-[11px] tracking-[0.15em]">
                      Jetzt buchen
                    </Button>
                  </Link>
                </motion.div>

                {/* Mobile contact */}
                <div className="mt-6 pt-6 border-t border-primary-foreground/10 flex flex-col items-center gap-2 text-[11px] font-body text-primary-foreground/50">
                  <a href="tel:+49421123456" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                    <Phone size={11} /> +49 421 123 456
                  </a>
                  <a href="mailto:info@hotel-bremen.de" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                    <Mail size={11} /> info@hotel-bremen.de
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
