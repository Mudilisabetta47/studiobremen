import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isWithinInterval, parseISO, isToday, isWeekend } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings"> & { rooms: { title: string } | null };

const AdminCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Tables<"rooms">[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      const [bRes, rRes] = await Promise.all([
        supabase.from("bookings").select("*, rooms(title)").or(`check_in.lte.${end},check_out.gte.${start}`).not("status", "eq", "cancelled"),
        supabase.from("rooms").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setBookings((bRes.data ?? []) as Booking[]);
      setRooms(rRes.data ?? []);
    };
    fetchData();
  }, [currentMonth]);

  const days = useMemo(() => eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  }), [currentMonth]);

  const getBookingsForRoomAndDay = (roomId: string, day: Date) => {
    return bookings.filter(b => {
      if (b.room_id !== roomId) return false;
      return isWithinInterval(day, { start: parseISO(b.check_in), end: parseISO(b.check_out) });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Verfügbarkeitskalender</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">{rooms.length} aktive Zimmer</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft size={15} />
          </Button>
          <div className="font-display text-sm font-semibold text-foreground min-w-[140px] text-center px-3 py-1.5 bg-card border border-border/60 rounded-lg">
            {format(currentMonth, "MMMM yyyy", { locale: de })}
          </div>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/60 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="p-3 text-left text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground sticky left-0 bg-card z-10 min-w-[130px]">
                Zimmer
              </th>
              {days.map(day => {
                const today = isToday(day);
                const weekend = isWeekend(day);
                return (
                  <th key={day.toISOString()} className={cn(
                    "p-1 text-center min-w-[32px]",
                    today && "bg-accent/10",
                    weekend && !today && "bg-muted/30"
                  )}>
                    <div className={cn(
                      "text-[10px] font-body font-medium",
                      today ? "text-accent" : "text-muted-foreground"
                    )}>{format(day, "dd")}</div>
                    <div className={cn(
                      "text-[9px] font-body",
                      today ? "text-accent/70" : "text-muted-foreground/60"
                    )}>{format(day, "EE", { locale: de })}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} className="border-b border-border/30 last:border-0 group">
                <td className="p-3 font-body font-medium text-foreground text-xs sticky left-0 bg-card z-10 group-hover:bg-muted/20 transition-colors">
                  {room.title}
                </td>
                {days.map(day => {
                  const dayBookings = getBookingsForRoomAndDay(room.id, day);
                  const isBooked = dayBookings.length > 0;
                  const today = isToday(day);
                  return (
                    <td
                      key={day.toISOString()}
                      className={cn(
                        "p-0.5 text-center transition-colors",
                        today && "bg-accent/5",
                      )}
                      title={isBooked ? dayBookings.map(b => b.guest_name).join(", ") : "Verfügbar"}
                    >
                      <div className={cn(
                        "w-full h-7 rounded-[4px] flex items-center justify-center text-[10px] font-body transition-all",
                        isBooked
                          ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                          : "bg-emerald-500/8 text-emerald-600/50 hover:bg-emerald-500/15"
                      )}>
                        {isBooked ? "●" : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div className="flex items-center gap-5 text-[11px] font-body text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500/10 border border-emerald-500/20" /> Verfügbar
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-destructive/15 border border-destructive/20" /> Gebucht
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-accent/10 border border-accent/20" /> Heute
        </span>
      </div>
    </div>
  );
};

export default AdminCalendar;
