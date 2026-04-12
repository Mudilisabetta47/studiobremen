import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Lock, Mail, User, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const GuestRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Passwort zu kurz", description: "Mindestens 6 Zeichen", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: window.location.origin + "/login",
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: err.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent/3 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="text-accent" size={40} />
          </motion.div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            E-Mail bestätigen
          </h2>
          <p className="font-body text-muted-foreground mb-8 leading-relaxed">
            Wir haben Ihnen eine E-Mail an <strong className="text-foreground">{email}</strong> gesendet.
            Klicken Sie auf den Bestätigungslink, um Ihr Konto zu aktivieren.
          </p>
          <Link to="/login">
            <Button variant="hero" size="lg" className="rounded-xl gap-2 group">
              Zum Login
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 px-16 text-primary-foreground"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-body font-semibold block mb-6">
            Neu hier?
          </span>
          <h2 className="font-display text-5xl font-bold leading-tight mb-6">
            Werden Sie<br />
            Teil unserer <span className="text-accent">Gäste</span>
          </h2>
          <p className="font-body text-primary-foreground/60 text-lg leading-relaxed max-w-md">
            Erstellen Sie ein Konto, um Ihre Buchungen zu verwalten und exklusive Vorteile zu genießen.
          </p>

          {/* Benefits */}
          <div className="mt-10 space-y-4">
            {["Buchungsübersicht auf einen Blick", "Schnellerer Check-in", "Exklusive Angebote"].map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles size={12} className="text-accent" />
                </div>
                <span className="font-body text-primary-foreground/70 text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-body text-muted-foreground hover:text-accent transition-colors mb-10 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Zurück zur Startseite
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Konto erstellen
            </h1>
            <p className="font-body text-muted-foreground">
              Registrieren Sie sich für Ihre persönliche Buchungsverwaltung
            </p>
          </motion.div>

          <form onSubmit={handleRegister} className="space-y-5">
            <motion.div variants={fadeUp} custom={2}>
              <label className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <User size={12} className="text-accent" /> Vollständiger Name
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Max Mustermann"
                required
                className="font-body h-12 bg-background border-border focus-visible:ring-accent rounded-xl"
              />
            </motion.div>
            <motion.div variants={fadeUp} custom={3}>
              <label className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <Mail size={12} className="text-accent" /> E-Mail-Adresse
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="font-body h-12 bg-background border-border focus-visible:ring-accent rounded-xl"
              />
            </motion.div>
            <motion.div variants={fadeUp} custom={4}>
              <label className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <Lock size={12} className="text-accent" /> Passwort
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                required
                minLength={6}
                className="font-body h-12 bg-background border-border focus-visible:ring-accent rounded-xl"
              />
            </motion.div>
            <motion.div variants={fadeUp} custom={5}>
              <Button
                variant="hero"
                className="w-full h-12 rounded-xl text-base gap-2 group"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? "Registrieren..." : (
                  <>
                    Konto erstellen
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={fadeUp} custom={6} className="mt-8 text-center">
            <p className="text-sm font-body text-muted-foreground">
              Bereits registriert?{" "}
              <Link to="/login" className="text-accent hover:underline font-medium">
                Jetzt anmelden
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GuestRegister;
