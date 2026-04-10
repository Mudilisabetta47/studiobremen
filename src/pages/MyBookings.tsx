import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  CalendarIcon, LogOut, MapPin, User, Loader2, BedDouble,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as SupaUser } from "@supabase/supabase-js";

interface BookingRow {
  id: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  guests_count: number;
  status: string;
  total_price: number | null;
  rooms: { title: string; slug: string } | null;
}

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ausstehend", cls: "bg-accent/15 text-accent" },
  confirmed: { label: "Bestätigt", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Storniert", cls: "bg-destructive/15 text-destructive" },
  completed: { label: "Abgeschlossen", cls: "bg-muted text-muted-foreground" },
};

const MyBookings = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from("bookings")
        .select("id, check_in, check_out, guest_name, guests_count, status, total_price, rooms(title, slug)")
        .eq("user_id", session.user.id)
        .order("check_in", { ascending: false });

      setBookings((data as any) ?? []);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-bold tracking-wider">
            IHR ZUHAUSE IN <span className="text-accent">BREMEN</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs font-body text-primary-foreground/60">
              <User size={12} className="inline mr-1" />
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut size={14} className="mr-1" /> Abmelden
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Meine Buchungen
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            Übersicht über alle Ihre Reservierungen
          </p>

          {bookings.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <BedDouble className="mx-auto mb-4 text-muted-foreground/40" size={48} />
              <p className="font-body text-muted-foreground mb-4">
                Sie haben noch keine Buchungen.
              </p>
              <Link to="/zimmer">
                <Button variant="hero">Zimmer entdecken</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b, i) => {
                const st = statusLabels[b.status] ?? statusLabels.pending;
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 space-y-1">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {b.rooms?.title ?? "Zimmer"}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm font-body text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon size={13} />
                          {format(new Date(b.check_in), "dd. MMM yyyy", { locale: de })} – {format(new Date(b.check_out), "dd. MMM yyyy", { locale: de })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={13} /> {b.guests_count} {b.guests_count === 1 ? "Gast" : "Gäste"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {b.total_price != null && (
                        <span className="font-display text-lg font-bold text-foreground">€{b.total_price}</span>
                      )}
                      <span className={cn("text-xs font-body font-medium px-3 py-1 rounded-full", st.cls)}>
                        {st.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyBookings;
