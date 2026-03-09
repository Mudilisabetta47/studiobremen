import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, User, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths,
  parseISO, isToday, isWeekend, isSameDay, differenceInDays, isBefore, isAfter,
} from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings"> & { rooms: { title: string } | null };

/* Distinct hues per room index for color-coded bars */
const roomColors = [
  { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-700", dot: "bg-blue-500" },
  { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-700", dot: "bg-amber-500" },
  { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-700", dot: "bg-emerald-500" },
  { bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-700", dot: "bg-violet-500" },
  { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-700", dot: "bg-rose-500" },
  { bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-700", dot: "bg-cyan-500" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Ausstehend", color: "bg-yellow-500" },
  confirmed: { label: "Bestätigt", color: "bg-emerald-500" },
  cancelled: { label: "Storniert", color: "bg-red-500" },
  completed: { label: "Abgeschlossen", color: "bg-blue-500" },
};

const AdminCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Tables<"rooms">[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const [bRes, rRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, rooms(title)")
        .or(`check_in.lte.${end},check_out.gte.${start}`)
        .not("status", "eq", "cancelled"),
      supabase.from("rooms").select("*").eq("is_active", true).order("sort_order"),
    ]);
    setBookings((bRes.data ?? []) as Booking[]);
    setRooms(rRes.data ?? []);
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const days = useMemo(() => eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  }), [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  /* Build a color map: roomId -> colorIndex */
  const roomColorMap = useMemo(() => {
    const map = new Map<string, number>();
    rooms.forEach((r, i) => map.set(r.id, i % roomColors.length));
    return map;
  }, [rooms]);

  /* For each room, get bookings that overlap this month, with bar position info */
  const getBookingBars = useCallback((roomId: string) => {
    return bookings
      .filter((b) => b.room_id === roomId)
      .map((b) => {
        const checkIn = parseISO(b.check_in);
        const checkOut = parseISO(b.check_out);
        // Clamp to visible month
        const visibleStart = isBefore(checkIn, monthStart) ? monthStart : checkIn;
        const visibleEnd = isAfter(checkOut, monthEnd) ? monthEnd : checkOut;
        const startCol = differenceInDays(visibleStart, monthStart); // 0-indexed
        const span = differenceInDays(visibleEnd, visibleStart);
        const startsBeforeMonth = isBefore(checkIn, monthStart);
        const endsAfterMonth = isAfter(checkOut, monthEnd);
        return { ...b, startCol, span, startsBeforeMonth, endsAfterMonth };
      })
      .filter((b) => b.span > 0);
  }, [bookings, monthStart, monthEnd]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Belegungskalender</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">
            {rooms.length} Zimmer · {bookings.length} aktive Buchungen
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            <ChevronLeft size={15} />
          </Button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="font-display text-sm font-semibold text-foreground min-w-[150px] text-center px-3 py-1.5 bg-card border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {format(currentMonth, "MMMM yyyy", { locale: de })}
          </button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <motion.div
        key={format(currentMonth, "yyyy-MM")}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm"
      >
        {loading ? (
          <div className="p-12 text-center text-muted-foreground font-body text-sm">Kalender wird geladen...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              {/* Day headers */}
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-3 text-left text-[10px] font-body font-semibold uppercase tracking-wider text-muted-foreground sticky left-0 bg-card z-20 min-w-[140px] border-r border-border/30">
                    Zimmer
                  </th>
                  {days.map((day) => {
                    const today = isToday(day);
                    const weekend = isWeekend(day);
                    return (
                      <th
                        key={day.toISOString()}
                        className={cn(
                          "p-0 text-center min-w-[36px] relative",
                          today && "bg-accent/8",
                          weekend && !today && "bg-muted/20",
                        )}
                      >
                        {today && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-b-full" />}
                        <div className={cn("text-[10px] font-body font-semibold pt-2", today ? "text-accent" : "text-foreground/70")}>
                          {format(day, "d")}
                        </div>
                        <div className={cn("text-[9px] font-body pb-1.5", today ? "text-accent/60" : "text-muted-foreground/50")}>
                          {format(day, "EE", { locale: de })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Room rows with booking bars */}
              <tbody>
                {rooms.map((room) => {
                  const colorIdx = roomColorMap.get(room.id) ?? 0;
                  const color = roomColors[colorIdx];
                  const bars = getBookingBars(room.id);

                  return (
                    <tr key={room.id} className="border-b border-border/20 last:border-0 group relative">
                      {/* Room label */}
                      <td className="p-3 sticky left-0 bg-card z-20 border-r border-border/30 group-hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2.5 h-2.5 rounded-full", color.dot)} />
                          <span className="font-body font-medium text-foreground text-xs">{room.title}</span>
                        </div>
                        <span className="font-body text-[10px] text-muted-foreground ml-[18px]">€{room.price_per_night}/N</span>
                      </td>

                      {/* Day cells */}
                      {days.map((day) => {
                        const today = isToday(day);
                        const weekend = isWeekend(day);
                        const dayBookings = bars.filter((b) => {
                          const bStart = differenceInDays(day, monthStart);
                          return bStart >= b.startCol && bStart < b.startCol + b.span;
                        });
                        const isBooked = dayBookings.length > 0;
                        const booking = dayBookings[0];
                        const isCheckIn = booking && isSameDay(day, parseISO(booking.check_in));
                        const isCheckOut = booking && isSameDay(day, parseISO(booking.check_out));

                        return (
                          <td
                            key={day.toISOString()}
                            className={cn(
                              "p-0 relative h-[52px]",
                              today && "bg-accent/5",
                              weekend && !today && "bg-muted/10",
                            )}
                          >
                            {isBooked && booking ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    className={cn(
                                      "absolute inset-x-0 top-1.5 bottom-1.5 cursor-pointer transition-all hover:brightness-90",
                                      color.bg,
                                      isCheckIn && "rounded-l-md ml-1 border-l-2",
                                      isCheckOut && "rounded-r-md mr-1",
                                      !isCheckIn && !isCheckOut && "border-l-0",
                                      isCheckIn && color.border,
                                    )}
                                  >
                                    {isCheckIn && (
                                      <span className={cn("absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-body font-semibold truncate max-w-[80px]", color.text)}>
                                        {booking.guest_name.split(" ")[0]}
                                      </span>
                                    )}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-0" align="start">
                                  <BookingPopover booking={booking} color={color} />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <div className="absolute inset-x-0 top-1.5 bottom-1.5" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={days.length + 1} className="p-12 text-center text-muted-foreground font-body text-sm">
                      Keine aktiven Zimmer vorhanden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-body text-muted-foreground">
        {rooms.map((room) => {
          const c = roomColors[roomColorMap.get(room.id) ?? 0];
          return (
            <span key={room.id} className="flex items-center gap-1.5">
              <span className={cn("w-3 h-3 rounded-sm", c.bg, "border", c.border)} />
              {room.title}
            </span>
          );
        })}
        <span className="ml-2 flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-accent/10 border border-accent/30" /> Heute
        </span>
      </div>
    </div>
  );
};

/* ── Booking Popover ── */

function BookingPopover({ booking, color }: { booking: Booking; color: typeof roomColors[number] }) {
  const status = statusConfig[booking.status] ?? statusConfig.pending;
  const nights = differenceInDays(parseISO(booking.check_out), parseISO(booking.check_in));

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", color.bg, color.text)}>
            {booking.guest_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-foreground">{booking.guest_name}</p>
            <p className="font-body text-[11px] text-muted-foreground">{booking.guest_email}</p>
          </div>
        </div>
        <span className={cn("w-2 h-2 rounded-full mt-1.5", status.color)} title={status.label} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-body">
        <div className="bg-muted/50 rounded-md p-2">
          <p className="text-muted-foreground">Anreise</p>
          <p className="font-semibold text-foreground">{format(parseISO(booking.check_in), "dd. MMM yyyy", { locale: de })}</p>
        </div>
        <div className="bg-muted/50 rounded-md p-2">
          <p className="text-muted-foreground">Abreise</p>
          <p className="font-semibold text-foreground">{format(parseISO(booking.check_out), "dd. MMM yyyy", { locale: de })}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-body border-t border-border pt-2">
        <span className="flex items-center gap-1 text-muted-foreground">
          <CalendarCheck size={12} /> {nights} {nights === 1 ? "Nacht" : "Nächte"}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <User size={12} /> {booking.guests_count} Gäste
        </span>
        {booking.total_price && (
          <span className="font-semibold text-foreground">€{booking.total_price}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[10px]">
        <span className={cn("w-1.5 h-1.5 rounded-full", status.color)} />
        <span className="text-muted-foreground">{status.label}</span>
      </div>
    </div>
  );
}

export default AdminCalendar;
