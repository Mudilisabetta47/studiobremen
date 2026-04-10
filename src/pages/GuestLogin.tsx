import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-xl"
      >
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-accent transition-colors mb-6">
          <ArrowLeft size={14} /> Zurück zur Startseite
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            IHR ZUHAUSE IN <span className="text-accent">BREMEN</span>
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            Melden Sie sich an, um Ihre Buchungen einzusehen
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
              <Mail size={14} /> E-Mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              required
              className="font-body"
            />
          </div>
          <div>
            <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
              <Lock size={14} /> Passwort
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="font-body"
            />
          </div>
          <Button variant="hero" className="w-full" size="lg" type="submit" disabled={loading}>
            {loading ? "Anmelden..." : "Anmelden"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm font-body text-muted-foreground">
            Noch kein Konto?{" "}
            <Link to="/registrieren" className="text-accent hover:underline font-medium">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default GuestLogin;
