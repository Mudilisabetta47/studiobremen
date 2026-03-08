import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BarChart3, Euro } from "lucide-react";
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

        months.push({
          month: label,
          bookings: data?.length ?? 0,
          revenue: data?.reduce((s, b) => s + (b.total_price ?? 0), 0) ?? 0,
        });
      }

      setMonthlyData(months);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const maxBookings = Math.max(...monthlyData.map(m => m.bookings), 1);
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  const totalBookings = monthlyData.reduce((s, m) => s + m.bookings, 0);
  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 bg-muted/40 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-16 bg-muted/40 animate-pulse rounded-xl" />
          <div className="h-16 bg-muted/40 animate-pulse rounded-xl" />
        </div>
        <div className="h-64 bg-muted/40 animate-pulse rounded-xl" />
      </div>
    );
  }

  const Chart = ({ data, maxVal, color, label, icon: Icon, valuePrefix = "" }: {
    data: typeof monthlyData; maxVal: number; color: string; label: string; icon: typeof BarChart3; valuePrefix?: string;
  }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/60 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className={`p-1.5 rounded-lg ${color === "accent" ? "bg-accent/10 text-accent" : "bg-emerald-500/10 text-emerald-500"}`}>
          <Icon size={16} />
        </div>
        <h2 className="font-display text-sm font-semibold text-foreground">{label}</h2>
      </div>
      <div className="flex items-end gap-2.5 h-44">
        {data.map(({ month, bookings, revenue }) => {
          const val = label.includes("Umsatz") ? revenue : bookings;
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1.5 group">
              <span className="text-[10px] font-body font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                {valuePrefix}{val.toLocaleString("de-DE")}
              </span>
              <div className="w-full relative rounded-t-md overflow-hidden bg-muted/30" style={{ height: "100%" }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, val > 0 ? 5 : 1)}%` }}
                  transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                  className={`absolute bottom-0 w-full rounded-t-md transition-colors ${
                    color === "accent"
                      ? "bg-accent/70 group-hover:bg-accent"
                      : "bg-emerald-500/60 group-hover:bg-emerald-500"
                  }`}
                />
              </div>
              <span className="text-[9px] font-body text-muted-foreground">{month}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Statistiken</h1>
        <p className="font-body text-sm text-muted-foreground mt-0.5">Letzte 6 Monate im Überblick</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/60 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-accent/10 text-accent"><BarChart3 size={20} /></div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground leading-none">{totalBookings}</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">Buchungen (6 Monate)</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border/60 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><Euro size={20} /></div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground leading-none">€{totalRevenue.toLocaleString("de-DE")}</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">Umsatz (6 Monate)</p>
          </div>
        </motion.div>
      </div>

      <Chart data={monthlyData} maxVal={maxBookings} color="accent" label="Buchungen pro Monat" icon={BarChart3} />
      <Chart data={monthlyData} maxVal={maxRevenue} color="green" label="Umsatz pro Monat" icon={Euro} valuePrefix="€" />
    </div>
  );
};

export default AdminStats;
