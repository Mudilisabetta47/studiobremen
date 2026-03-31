import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumbs from "@/components/Breadcrumbs";

const Contact = () => {
  return (
    <main className="pt-28 md:pt-32">
      <div className="container mx-auto px-4 pt-3">
        <Breadcrumbs items={[{ label: "Kontakt" }]} />
      </div>
      {/* Header */}
      <section className="bg-gradient-hotel py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent tracking-[0.2em] uppercase text-xs font-body mb-3">Kontakt</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
              Wir freuen uns auf Sie
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="font-display text-2xl font-semibold mb-8">Kontaktinformationen</h2>
            <div className="space-y-6">
              {[
                { icon: MapPin, label: "Adresse", value: "Musterstraße 1, 28195 Bremen" },
                { icon: Phone, label: "Telefon", value: "+49 421 123 456" },
                { icon: Mail, label: "E-Mail", value: "info@hotel-bremen.de" },
                { icon: Clock, label: "Rezeption", value: "24 Stunden geöffnet" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-body uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="font-body text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="font-display text-2xl font-semibold mb-8">Nachricht senden</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Name</label>
                  <Input placeholder="Ihr Name" className="font-body" />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">E-Mail</label>
                  <Input type="email" placeholder="ihre@email.de" className="font-body" />
                </div>
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Betreff</label>
                <Input placeholder="Wie können wir helfen?" className="font-body" />
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Nachricht</label>
                <Textarea placeholder="Ihre Nachricht..." rows={5} className="font-body" />
              </div>
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Nachricht senden
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
