import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Lock, Mail, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-xl text-center"
        >
          <CheckCircle2 className="mx-auto mb-4 text-accent" size={48} />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            E-Mail bestätigen
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Wir haben Ihnen eine E-Mail an <strong>{email}</strong> gesendet.
            Bitte klicken Sie auf den Bestätigungslink, um Ihr Konto zu aktivieren.
          </p>
          <Link to="/login">
            <Button variant="hero" size="lg">Zum Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
            Konto <span className="text-accent">erstellen</span>
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            Registrieren Sie sich, um Ihre Buchungen zu verwalten
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
              <User size={14} /> Name
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Max Mustermann"
              required
              className="font-body"
            />
          </div>
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
              placeholder="Mindestens 6 Zeichen"
              required
              minLength={6}
              className="font-body"
            />
          </div>
          <Button variant="hero" className="w-full" size="lg" type="submit" disabled={loading}>
            {loading ? "Registrieren..." : "Konto erstellen"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm font-body text-muted-foreground">
            Bereits registriert?{" "}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Jetzt anmelden
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default GuestRegister;
