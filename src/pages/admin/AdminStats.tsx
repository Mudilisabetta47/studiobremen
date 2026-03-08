import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Euro, CalendarDays } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { de } from "date-fns/locale";

const AdminStats = () => {
  const [monthlyData, setMonthlyData] = useState<{ month: string; bookings: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const months: { month: string; bookings: number; revenue: number }[] = [];

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
        const end = format(endOfMonth(monthDate), "yyyy-MM-dd");
        const label = format(monthDate, "MMM yy", { locale: de });

        const { data } = await supabase.from("bookings")
          .select("total_price")
          .gte("check_in", start)
          .lte("check_in", end)
          .not("status", "eq", "cancelled");

        const bookings = data?.length ?? 0;
        const revenue = data?.reduce((s, b) => s + (b.total_price ?? 0), 0) ?? 0;
        months.push({ month: label, bookings, revenue });
      }

      setMonthlyData(months);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const maxBookings = Math.max(...monthlyData.map(m => m.bookings), 1);
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Statistiken</h1>
        <p className="font-body text-muted-foreground mt-1">Leistungsübersicht der letzten 6 Monate</p>
      </div>

      {/* Bookings Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={18} className="text-accent" />
          <h2 className="font-display text-lg font-semibold text-foreground">Buchungen pro Monat</h2>
        </div>
        <div className="flex items-end gap-3 h-48">
          {monthlyData.map(({ month, bookings }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-body font-medium text-foreground">{bookings}</span>
              <div
                className="w-full bg-accent/80 rounded-t-md transition-all"
                style={{ height: `${(bookings / maxBookings) * 100}%`, minHeight: bookings > 0 ? 8 : 2 }}
              />
              <span className="text-[10px] font-body text-muted-foreground">{month}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Euro size={18} className="text-green-500" />
          <h2 className="font-display text-lg font-semibold text-foreground">Umsatz pro Monat</h2>
        </div>
        <div className="flex items-end gap-3 h-48">
          {monthlyData.map(({ month, revenue }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-body font-medium text-foreground">€{revenue}</span>
              <div
                className="w-full bg-green-500/70 rounded-t-md transition-all"
                style={{ height: `${(revenue / maxRevenue) * 100}%`, minHeight: revenue > 0 ? 8 : 2 }}
              />
              <span className="text-[10px] font-body text-muted-foreground">{month}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminStats;
