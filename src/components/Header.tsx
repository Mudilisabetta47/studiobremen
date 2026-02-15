import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "Startseite" },
  { to: "/zimmer", label: "Zimmer" },
  { to: "/kontakt", label: "Kontakt" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isHome ? "bg-primary/80 backdrop-blur-md" : "bg-primary shadow-lg"}`}>
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        <Link to="/" className="font-display text-2xl font-bold text-primary-foreground tracking-wider">
          HOTEL <span className="text-accent">BREMEN</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-body text-sm tracking-widest uppercase transition-colors duration-300 ${
                location.pathname === link.to
                  ? "text-accent"
                  : "text-primary-foreground/80 hover:text-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/zimmer">
            <Button variant="hero" size="sm">
              Jetzt buchen
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menü"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary border-t border-primary-foreground/10"
          >
            <nav className="flex flex-col items-center gap-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`font-body text-sm tracking-widest uppercase ${
                    location.pathname === link.to ? "text-accent" : "text-primary-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/zimmer" onClick={() => setMobileOpen(false)}>
                <Button variant="hero" size="sm">
                  Jetzt buchen
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
