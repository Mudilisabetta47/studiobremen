import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const GuestLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/meine-buchungen");
    } catch (err: any) {
      toast({
        title: "Login fehlgeschlagen",
        description: err.message === "Invalid login credentials"
          ? "E-Mail oder Passwort ist falsch"
          : err.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent/3 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Left decorative panel - hidden on mobile */}
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
            Willkommen zurück
          </span>
          <h2 className="font-display text-5xl font-bold leading-tight mb-6">
            Ihr Zuhause<br />
            in <span className="text-accent">Bremen</span>
          </h2>
          <p className="font-body text-primary-foreground/60 text-lg leading-relaxed max-w-md">
            Melden Sie sich an, um Ihre Buchungen einzusehen und Ihren nächsten Aufenthalt zu planen.
          </p>
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
              Anmelden
            </h1>
            <p className="font-body text-muted-foreground">
              Verwalten Sie Ihre Buchungen und Aufenthalte
            </p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div variants={fadeUp} custom={2}>
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
            <motion.div variants={fadeUp} custom={3}>
              <label className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <Lock size={12} className="text-accent" /> Passwort
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="font-body h-12 bg-background border-border focus-visible:ring-accent rounded-xl"
              />
            </motion.div>
            <motion.div variants={fadeUp} custom={4}>
              <Button
                variant="hero"
                className="w-full h-12 rounded-xl text-base gap-2 group"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? "Anmelden..." : (
                  <>
                    Anmelden
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={fadeUp} custom={5} className="mt-8 text-center">
            <p className="text-sm font-body text-muted-foreground">
              Noch kein Konto?{" "}
              <Link to="/registrieren" className="text-accent hover:underline font-medium">
                Jetzt registrieren
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GuestLogin;
