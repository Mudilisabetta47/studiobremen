import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check admin role
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin");

      if (roleError || !roles || roles.length === 0) {
        await supabase.auth.signOut();
        throw new Error("Kein Admin-Zugang");
      }

      navigate("/admin");
    } catch (err: any) {
      toast({
        title: "Login fehlgeschlagen",
        description: err.message || "Ungültige Anmeldedaten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hotel flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            HOTEL <span className="text-accent">BREMEN</span>
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">Admin-Panel</p>
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
              placeholder="admin@hotel-bremen.de"
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
      </motion.div>
    </div>
  );
};

export default AdminLogin;
