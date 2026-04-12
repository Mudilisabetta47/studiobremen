import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <h3 className="font-display text-xl tracking-[0.15em] mb-5">
              BOLM <span className="text-accent">APARTMENTS</span>
            </h3>
            <p className="font-body text-primary-foreground/50 text-sm leading-relaxed max-w-xs">
              Erstklassiger Komfort und norddeutsche Gastfreundschaft – 
              Ihr Zuhause in der Hansestadt.
            </p>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground/40 mb-5">Kontakt</h4>
            <div className="space-y-3 text-sm text-primary-foreground/60 font-body">
              <p className="flex items-center gap-2.5">
                <MapPin size={13} className="text-accent/60 shrink-0" />
                Musterstraße 1, 28195 Bremen
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={13} className="text-accent/60 shrink-0" />
                +49 421 123 456
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={13} className="text-accent/60 shrink-0" />
                info@hotel-bremen.de
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground/40 mb-5">Rechtliches</h4>
            <div className="space-y-2.5 text-sm font-body">
              <Link to="/impressum" className="block text-primary-foreground/50 hover:text-accent transition-colors duration-300">
                Impressum
              </Link>
              <Link to="/datenschutz" className="block text-primary-foreground/50 hover:text-accent transition-colors duration-300">
                Datenschutz
              </Link>
              <Link to="/agb" className="block text-primary-foreground/50 hover:text-accent transition-colors duration-300">
                AGB
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground/40 mb-5">Navigation</h4>
            <div className="space-y-2.5 text-sm font-body">
              <Link to="/" className="block text-primary-foreground/50 hover:text-accent transition-colors duration-300">
                Start
              </Link>
              <Link to="/zimmer" className="block text-primary-foreground/50 hover:text-accent transition-colors duration-300">
                Apartments
              </Link>
              <Link to="/kontakt" className="block text-primary-foreground/50 hover:text-accent transition-colors duration-300">
                Kontakt
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/8 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-primary-foreground/30 font-body tracking-wide">
            © {new Date().getFullYear()} Bolm Arpartmens. Alle Rechte vorbehalten.
          </p>
          <p className="text-[11px] text-primary-foreground/30 font-body tracking-wide">
            Bremen, Deutschland
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
