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

      <section className="bg-primary py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-accent font-medium">
              Kontakt
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary-foreground mt-3">
              Wir freuen uns auf Sie
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="font-display text-2xl font-semibold mb-10">Kontaktinformationen</h2>
            <div className="space-y-8">
              {[
                { icon: MapPin, label: "Adresse", value: "Musterstraße 1, 28195 Bremen" },
                { icon: Phone, label: "Telefon", value: "+49 421 123 456" },
                { icon: Mail, label: "E-Mail", value: "info@hotel-bremen.de" },
                { icon: Clock, label: "Erreichbarkeit", value: "Mo–Fr, 9–18 Uhr" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <Icon size={16} className="text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-0.5">{label}</p>
                    <p className="font-body text-foreground text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h2 className="font-display text-2xl font-semibold mb-10">Nachricht senden</h2>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-1.5 block">Name</label>
                  <Input placeholder="Ihr Name" className="font-body" />
                </div>
                <div>
                  <label className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-1.5 block">E-Mail</label>
                  <Input type="email" placeholder="ihre@email.de" className="font-body" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-1.5 block">Betreff</label>
                <Input placeholder="Wie können wir helfen?" className="font-body" />
              </div>
              <div>
                <label className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-1.5 block">Nachricht</label>
                <Textarea placeholder="Ihre Nachricht..." rows={6} className="font-body" />
              </div>
              <Button variant="hero" size="lg" className="w-full sm:w-auto px-12">
                Absenden
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
