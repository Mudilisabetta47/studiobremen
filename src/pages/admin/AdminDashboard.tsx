import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BedDouble, BookOpen, Users, TrendingUp } from "lucide-react";

interface Stats {
  rooms: number;
  bookings: number;
  pending: number;
  confirmed: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ rooms: 0, bookings: 0, pending: 0, confirmed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [roomsRes, bookingsRes, pendingRes, confirmedRes] = await Promise.all([
        supabase.from("rooms").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
      ]);
      setStats({
        rooms: roomsRes.count ?? 0,
        bookings: bookingsRes.count ?? 0,
        pending: pendingRes.count ?? 0,
        confirmed: confirmedRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Zimmer", value: stats.rooms, icon: BedDouble, color: "text-accent" },
    { label: "Buchungen gesamt", value: stats.bookings, icon: BookOpen, color: "text-accent" },
    { label: "Ausstehend", value: stats.pending, icon: Users, color: "text-yellow-500" },
    { label: "Bestätigt", value: stats.confirmed, icon: TrendingUp, color: "text-green-500" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-body text-muted-foreground">{label}</span>
              <Icon size={20} className={color} />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
