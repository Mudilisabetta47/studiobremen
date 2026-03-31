import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-4">
              IHR ZUHAUSE IN <span className="text-accent">BREMEN</span>
            </h3>
            <p className="font-body text-primary-foreground/70 text-sm leading-relaxed">
              Ihr Zuhause in Bremen. Erleben Sie erstklassigen Komfort und norddeutsche Gastfreundschaft in unseren Apartments.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4">Kontakt</h4>
            <div className="space-y-3 text-sm text-primary-foreground/70">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                Musterstraße 1, 28195 Bremen
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                +49 421 123 456
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                info@hotel-bremen.de
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/impressum" className="block text-primary-foreground/70 hover:text-accent transition-colors">
                Impressum
              </Link>
              <Link to="/datenschutz" className="block text-primary-foreground/70 hover:text-accent transition-colors">
                Datenschutz
              </Link>
              <Link to="/agb" className="block text-primary-foreground/70 hover:text-accent transition-colors">
                AGB
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Hotel Bremen. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
