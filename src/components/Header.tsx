import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import bremenWappen from "@/assets/bremen-wappen.svg";

const navLinks = [
  { to: "/", label: "Start" },
  { to: "/zimmer", label: "Apartments" },
  { to: "/kontakt", label: "Kontakt" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { scrollY } = useScroll();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60);
  });

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-700",
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
          : isHome
            ? "bg-transparent"
            : "bg-primary",
      )}
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <img src={bremenWappen} alt="Bremen Wappen" className="h-9 w-auto" />
          <div className="flex items-baseline">
            <span className={cn(
              "font-display text-lg tracking-[0.15em] transition-colors duration-500",
              scrolled ? "text-foreground" : "text-primary-foreground",
            )}>
              STUDIO
            </span>
            <span className={cn(
              "font-display text-lg tracking-[0.15em] ml-1.5 transition-colors duration-500",
              "text-accent",
            )}>
              BREMEN
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative py-2 group"
              >
                <span className={cn(
                  "font-body text-[11px] tracking-[0.25em] uppercase transition-colors duration-300",
                  scrolled
                    ? isActive ? "text-accent" : "text-foreground/60 group-hover:text-foreground"
                    : isActive ? "text-accent" : "text-primary-foreground/60 group-hover:text-primary-foreground",
                )}>
                  {link.label}
                </span>
                <span className={cn(
                  "absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-500",
                  isActive ? "w-full" : "w-0 group-hover:w-full",
                )} />
              </Link>
            );
          })}

          <div className={cn(
            "w-px h-4 mx-2 transition-colors",
            scrolled ? "bg-border" : "bg-primary-foreground/15",
          )} />

          <Link to={isLoggedIn ? "/meine-buchungen" : "/login"}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3 text-[10px] tracking-[0.2em] uppercase",
                scrolled
                  ? "text-foreground/60 hover:text-foreground hover:bg-muted"
                  : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5",
              )}
            >
              <User size={13} className="mr-1.5" />
              {isLoggedIn ? "Konto" : "Login"}
            </Button>
          </Link>

          <Link to="/zimmer">
            <Button variant="hero" size="sm" className="px-8 text-[10px] tracking-[0.2em]">
              Buchen
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className={cn(
            "lg:hidden w-10 h-10 flex items-center justify-center transition-colors",
            scrolled ? "text-foreground" : "text-primary-foreground",
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menü"
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Menu size={20} />
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
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={cn(
              "lg:hidden overflow-hidden border-t",
              scrolled ? "bg-background border-border" : "bg-primary border-primary-foreground/10",
            )}
          >
            <nav className="flex flex-col items-center gap-1 py-10 px-4">
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
                      "font-body text-sm tracking-[0.25em] uppercase py-3 px-8 rounded transition-colors",
                      scrolled
                        ? location.pathname === link.to
                          ? "text-accent"
                          : "text-foreground/60 hover:text-foreground"
                        : location.pathname === link.to
                          ? "text-accent"
                          : "text-primary-foreground/60 hover:text-primary-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
                <Link to="/zimmer" onClick={() => setMobileOpen(false)}>
                  <Button variant="hero" className="px-10 text-[10px] tracking-[0.2em]">
                    Jetzt buchen
                  </Button>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
