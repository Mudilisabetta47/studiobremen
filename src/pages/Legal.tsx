import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const legalContent: Record<string, { title: string; content: string }> = {
  "/impressum": {
    title: "Impressum",
    content: `Hotel Bremen GmbH\nMusterstraße 1\n28195 Bremen\n\nTelefon: +49 421 123 456\nE-Mail: info@hotel-bremen.de\n\nGeschäftsführer: Max Mustermann\nHandelsregister: HRB 12345, Amtsgericht Bremen\nUSt-IdNr.: DE123456789\n\nVerantwortlich für den Inhalt nach § 55 Abs. 2 RStV:\nMax Mustermann, Musterstraße 1, 28195 Bremen`,
  },
  "/datenschutz": {
    title: "Datenschutzerklärung",
    content: `Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unseres Onlineangebotes auf.\n\nVerantwortlicher: Hotel Bremen GmbH, Musterstraße 1, 28195 Bremen\n\nWir verarbeiten personenbezogene Daten unserer Nutzer nur unter Einhaltung der einschlägigen Datenschutzbestimmungen. Das bedeutet, die Daten der Nutzer werden nur bei Vorliegen einer gesetzlichen Erlaubnis verarbeitet.\n\nBitte ersetzen Sie diesen Platzhaltertext durch Ihre vollständige Datenschutzerklärung.`,
  },
  "/agb": {
    title: "Allgemeine Geschäftsbedingungen",
    content: `1. Geltungsbereich\nDiese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über die mietweise Überlassung von Hotelzimmern zur Beherbergung.\n\n2. Vertragsschluss\nDer Vertrag kommt durch die Annahme des Antrags des Gastes durch das Hotel zustande.\n\n3. Leistungen\nDas Hotel ist verpflichtet, die vom Gast gebuchten Zimmer bereit zu halten und die vereinbarten Leistungen zu erbringen.\n\nBitte ersetzen Sie diesen Platzhaltertext durch Ihre vollständigen AGB.`,
  },
};

const Legal = () => {
  const location = useLocation();
  const page = legalContent[location.pathname] || legalContent["/impressum"];

  return (
    <main className="pt-20">
      <section className="bg-gradient-hotel py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-primary-foreground"
          >
            {page.title}
          </motion.h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-body text-muted-foreground leading-relaxed whitespace-pre-line"
        >
          {page.content}
        </motion.div>
      </section>
    </main>
  );
};

export default Legal;
