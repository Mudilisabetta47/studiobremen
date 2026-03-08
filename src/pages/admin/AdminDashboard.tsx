import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BedDouble, BookOpen, Users, CalendarDays,
  ArrowUpRight, Clock, CheckCircle2, XCircle, AlertCircle,
  Euro, BarChart3,
} from "lucide-react";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings"> & { rooms: { title: string } | null };

interface Stats {
  rooms: number;
  totalBookings: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  totalRevenue: number;
  avgGuests: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    rooms: 0, totalBookings: 0, pending: 0, confirmed: 0,
    cancelled: 0, completed: 0, totalRevenue: 0, avgGuests: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [upcomingArrivals, setUpcomingArrivals] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const weekAhead = format(subDays(new Date(), -7), "yyyy-MM-dd");

      const [roomsRes, allBookings, recentRes, arrivalsRes] = await Promise.all([
        supabase.from("rooms").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("status, total_price, guests_count"),
        supabase.from("bookings").select("*, rooms(title)").order("created_at", { ascending: false }).limit(5),
        supabase.from("bookings").select("*, rooms(title)")
          .gte("check_in", today).lte("check_in", weekAhead)
          .not("status", "eq", "cancelled")
          .order("check_in"),
      ]);

      const bookingsData = allBookings.data ?? [];
      const pending = bookingsData.filter(b => b.status === "pending").length;
      const confirmed = bookingsData.filter(b => b.status === "confirmed").length;
      const cancelled = bookingsData.filter(b => b.status === "cancelled").length;
      const completed = bookingsData.filter(b => b.status === "completed").length;
      const totalRevenue = bookingsData.reduce((sum, b) => sum + (b.total_price ?? 0), 0);
      const avgGuests = bookingsData.length > 0
        ? Math.round(bookingsData.reduce((sum, b) => sum + (b.guests_count ?? 1), 0) / bookingsData.length * 10) / 10
        : 0;

      setStats({
        rooms: roomsRes.count ?? 0,
        totalBookings: bookingsData.length,
        pending, confirmed, cancelled, completed,
        totalRevenue, avgGuests,
      });
      setRecentBookings((recentRes.data ?? []) as Booking[]);
      setUpcomingArrivals((arrivalsRes.data ?? []) as Booking[]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
    pending: { label: "Ausstehend", icon: Clock, className: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    confirmed: { label: "Bestätigt", icon: CheckCircle2, className: "text-green-600 bg-green-50 border-green-200" },
    cancelled: { label: "Storniert", icon: XCircle, className: "text-destructive bg-destructive/10 border-destructive/20" },
    completed: { label: "Abgeschlossen", icon: AlertCircle, className: "text-blue-600 bg-blue-50 border-blue-200" },
  };

  const statCards = [
    { label: "Zimmer", value: stats.rooms, icon: BedDouble, color: "from-accent/20 to-accent/5", iconColor: "text-accent", link: "/admin/rooms" },
    { label: "Buchungen", value: stats.totalBookings, icon: BookOpen, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-500", link: "/admin/bookings" },
    { label: "Ausstehend", value: stats.pending, icon: Clock, color: "from-yellow-500/20 to-yellow-500/5", iconColor: "text-yellow-500", link: "/admin/bookings" },
    { label: "Bestätigt", value: stats.confirmed, icon: CheckCircle2, color: "from-green-500/20 to-green-500/5", iconColor: "text-green-500", link: "/admin/bookings" },
  ];

  const quickActions = [
    { label: "Zimmer verwalten", icon: BedDouble, to: "/admin/rooms", desc: "Hinzufügen, bearbeiten, löschen" },
    { label: "Buchungen", icon: BookOpen, to: "/admin/bookings", desc: "Alle Buchungen einsehen" },
    { label: "Kalender", icon: CalendarDays, to: "/admin/calendar", desc: "Verfügbarkeit prüfen" },
    { label: "Statistiken", icon: BarChart3, to: "/admin/stats", desc: "Umsatz & Performance" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="font-body text-muted-foreground mt-1">
          Übersicht für {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, iconColor, link }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={link} className="block group">
              <div className={`bg-gradient-to-br ${color} border border-border rounded-xl p-5 transition-all hover:shadow-md hover:scale-[1.02]`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-background/60 ${iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <ArrowUpRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-display text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm font-body text-muted-foreground mt-1">{label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Avg Guests Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            <Euro size={24} />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground">€{stats.totalRevenue.toLocaleString("de-DE")}</p>
            <p className="text-sm font-body text-muted-foreground">Gesamtumsatz</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Users size={24} />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground">{stats.avgGuests}</p>
            <p className="text-sm font-body text-muted-foreground">Ø Gäste pro Buchung</p>
          </div>
        </motion.div>
      </div>

      {/* Two columns: Recent Bookings + Upcoming Arrivals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Letzte Buchungen</h2>
            <Link to="/admin/bookings" className="text-xs text-accent hover:underline font-body flex items-center gap-1">
              Alle <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentBookings.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground font-body text-center">Keine Buchungen vorhanden</p>
            ) : recentBookings.map((b) => {
              const st = statusConfig[b.status] ?? statusConfig.pending;
              const StIcon = st.icon;
              return (
                <div key={b.id} className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className={`p-1.5 rounded-md border ${st.className}`}>
                    <StIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-sm text-foreground truncate">{b.guest_name}</p>
                    <p className="text-xs text-muted-foreground font-body">{b.rooms?.title ?? "–"} · {b.check_in} → {b.check_out}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-body ${st.className}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Arrivals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Anreisen (nächste 7 Tage)</h2>
            <Link to="/admin/calendar" className="text-xs text-accent hover:underline font-body flex items-center gap-1">
              Kalender <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingArrivals.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground font-body text-center">Keine Anreisen geplant</p>
            ) : upcomingArrivals.map((b) => (
              <div key={b.id} className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className="p-1.5 rounded-md bg-accent/10 text-accent border border-accent/20">
                  <CalendarDays size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-sm text-foreground truncate">{b.guest_name}</p>
                  <p className="text-xs text-muted-foreground font-body">{b.rooms?.title ?? "–"} · {b.guests_count} Gäste</p>
                </div>
                <span className="text-xs font-body text-foreground font-medium">
                  {format(parseISO(b.check_in), "dd.MM.")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, to, desc }) => (
            <Link key={to} to={to}
              className="group bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-accent/30 transition-all"
            >
              <Icon size={20} className="text-accent mb-2" />
              <p className="font-body font-medium text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
