import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BedDouble, BookOpen, Users, CalendarDays,
  ArrowUpRight, Clock, CheckCircle2, XCircle, AlertCircle,
  Euro, BarChart3, Activity,
} from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
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

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

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

      setStats({ rooms: roomsRes.count ?? 0, totalBookings: bookingsData.length, pending, confirmed, cancelled, completed, totalRevenue, avgGuests });
      setRecentBookings((recentRes.data ?? []) as Booking[]);
      setUpcomingArrivals((arrivalsRes.data ?? []) as Booking[]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const statusConfig: Record<string, { label: string; icon: typeof Clock; bg: string; text: string; dot: string }> = {
    pending: { label: "Ausstehend", icon: Clock, bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    confirmed: { label: "Bestätigt", icon: CheckCircle2, bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
    cancelled: { label: "Storniert", icon: XCircle, bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
    completed: { label: "Abgeschlossen", icon: AlertCircle, bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
  };

  const statCards = [
    { label: "Zimmer", value: stats.rooms, icon: BedDouble, gradient: "from-accent/15 via-accent/5 to-transparent", iconBg: "bg-accent/15", iconColor: "text-accent", link: "/admin/rooms" },
    { label: "Buchungen", value: stats.totalBookings, icon: BookOpen, gradient: "from-blue-500/15 via-blue-500/5 to-transparent", iconBg: "bg-blue-500/15", iconColor: "text-blue-500", link: "/admin/bookings" },
    { label: "Ausstehend", value: stats.pending, icon: Clock, gradient: "from-amber-500/15 via-amber-500/5 to-transparent", iconBg: "bg-amber-500/15", iconColor: "text-amber-500", link: "/admin/bookings" },
    { label: "Bestätigt", value: stats.confirmed, icon: CheckCircle2, gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-500", link: "/admin/bookings" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 bg-muted/60 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[120px] bg-muted/40 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-72 bg-muted/40 animate-pulse rounded-xl" />
          <div className="h-72 bg-muted/40 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Willkommen zurück
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="font-body text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Link to="/admin/bookings">
            <button className="hidden sm:flex items-center gap-2 text-xs font-body font-medium text-accent hover:text-accent/80 transition-colors bg-accent/10 px-3.5 py-2 rounded-lg hover:bg-accent/15">
              <Activity size={14} /> Live-Ansicht
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, gradient, iconBg, iconColor, link }, i) => (
          <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <Link to={link} className="block group">
              <div className={`relative bg-card border border-border/60 rounded-xl p-5 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/20 hover:-translate-y-0.5`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${iconBg}`}>
                      <Icon size={18} className={iconColor} />
                    </div>
                    <ArrowUpRight size={14} className="text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </div>
                  <p className="font-display text-[28px] font-bold text-foreground leading-none">{value}</p>
                  <p className="text-xs font-body text-muted-foreground mt-1.5 tracking-wide">{label}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Guests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible"
          className="bg-card border border-border/60 rounded-xl p-5 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent/15 transition-colors">
            <Euro size={22} />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground leading-none">€{stats.totalRevenue.toLocaleString("de-DE")}</p>
            <p className="text-xs font-body text-muted-foreground mt-1">Gesamtumsatz</p>
          </div>
        </motion.div>
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible"
          className="bg-card border border-border/60 rounded-xl p-5 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/15 transition-colors">
            <Users size={22} />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground leading-none">{stats.avgGuests}</p>
            <p className="text-xs font-body text-muted-foreground mt-1">Ø Gäste pro Buchung</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings + Upcoming Arrivals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible"
          className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">Letzte Buchungen</h2>
            <Link to="/admin/bookings" className="text-[11px] text-accent hover:text-accent/80 font-body font-medium flex items-center gap-1 transition-colors">
              Alle <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground font-body">Keine Buchungen vorhanden</p>
              </div>
            ) : recentBookings.map((b) => {
              const st = statusConfig[b.status] ?? statusConfig.pending;
              const StIcon = st.icon;
              return (
                <div key={b.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                  <div className={`p-1.5 rounded-lg ${st.bg}`}>
                    <StIcon size={13} className={st.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-[13px] text-foreground truncate">{b.guest_name}</p>
                    <p className="text-[11px] text-muted-foreground font-body mt-0.5">{b.rooms?.title ?? "–"} · {b.check_in} → {b.check_out}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <span className={`text-[10px] font-body font-medium ${st.text}`}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible"
          className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">Anreisen (7 Tage)</h2>
            <Link to="/admin/calendar" className="text-[11px] text-accent hover:text-accent/80 font-body font-medium flex items-center gap-1 transition-colors">
              Kalender <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {upcomingArrivals.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarDays size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground font-body">Keine Anreisen geplant</p>
              </div>
            ) : upcomingArrivals.map((b) => (
              <div key={b.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <CalendarDays size={13} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-[13px] text-foreground truncate">{b.guest_name}</p>
                  <p className="text-[11px] text-muted-foreground font-body mt-0.5">{b.rooms?.title ?? "–"} · {b.guests_count} Gäste</p>
                </div>
                <span className="text-xs font-body text-foreground font-semibold tabular-nums">
                  {format(parseISO(b.check_in), "dd.MM.")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible">
        <h2 className="font-display text-base font-semibold text-foreground mb-3">Schnellzugriff</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Zimmer verwalten", icon: BedDouble, to: "/admin/rooms", desc: "Hinzufügen & bearbeiten" },
            { label: "Buchungen", icon: BookOpen, to: "/admin/bookings", desc: "Übersicht & Details" },
            { label: "Kalender", icon: CalendarDays, to: "/admin/calendar", desc: "Verfügbarkeiten" },
            { label: "Statistiken", icon: BarChart3, to: "/admin/stats", desc: "Umsatz & Performance" },
          ].map(({ label, icon: Icon, to, desc }) => (
            <Link key={to} to={to}
              className="group bg-card border border-border/60 rounded-xl p-4 hover:shadow-md hover:border-accent/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-accent/10 w-fit mb-3 group-hover:bg-accent/15 transition-colors">
                <Icon size={16} className="text-accent" />
              </div>
              <p className="font-body font-medium text-[13px] text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground font-body mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
