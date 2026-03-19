import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, User, CalendarCheck, Moon, Calendar,
  ArrowRight, GripVertical, Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths,
  parseISO, isToday, isWeekend, isSameDay, differenceInDays, isBefore, isAfter,
  addDays,
} from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings"> & { rooms: { title: string } | null };

type BookingBar = Booking & {
  startCol: number;
  span: number;
  startsBeforeMonth: boolean;
  endsAfterMonth: boolean;
};

/* ── Color palette ── */
const roomPalette = [
  { bg: "bg-accent/15", border: "border-accent/40", text: "text-accent-foreground", dot: "bg-accent" },
  { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", dot: "bg-primary" },
  { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", dot: "bg-destructive" },
  { bg: "bg-emerald-500/15", border: "border-emerald-500/35", text: "text-emerald-700", dot: "bg-emerald-500" },
  { bg: "bg-violet-500/15", border: "border-violet-500/35", text: "text-violet-700", dot: "bg-violet-500" },
  { bg: "bg-sky-500/15", border: "border-sky-500/35", text: "text-sky-700", dot: "bg-sky-500" },
];

const statusConfig: Record<string, { label: string; dotClass: string }> = {
  pending: { label: "Ausstehend", dotClass: "bg-amber-400" },
  confirmed: { label: "Bestätigt", dotClass: "bg-emerald-500" },
  cancelled: { label: "Storniert", dotClass: "bg-destructive" },
  completed: { label: "Abgeschlossen", dotClass: "bg-primary" },
};

/* ── Drag payload ── */
interface DragPayload {
  bookingId: string;
  originalCheckIn: string;
  originalCheckOut: string;
  originalRoomId: string;
  /** The day index the user grabbed */
  grabDayIdx: number;
}

const AdminCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Tables<"rooms">[]>([]);
  const [loading, setLoading] = useState(true);

  /* Drag state */
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<{ roomId: string; dayIdx: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastMove, setLastMove] = useState<{
    bookingId: string;
    prevCheckIn: string;
    prevCheckOut: string;
    prevRoomId: string;
  } | null>(null);

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

  const roomColorMap = useMemo(() => {
    const map = new Map<string, number>();
    rooms.forEach((r, i) => map.set(r.id, i % roomPalette.length));
    return map;
  }, [rooms]);

  const getBookingBars = useCallback((roomId: string): BookingBar[] => {
    return bookings
      .filter((b) => b.room_id === roomId)
      .map((b) => {
        const checkIn = parseISO(b.check_in);
        const checkOut = parseISO(b.check_out);
        const visibleStart = isBefore(checkIn, monthStart) ? monthStart : checkIn;
        const visibleEnd = isAfter(checkOut, monthEnd) ? monthEnd : checkOut;
        const startCol = differenceInDays(visibleStart, monthStart);
        const span = differenceInDays(visibleEnd, visibleStart);
        const startsBeforeMonth = isBefore(checkIn, monthStart);
        const endsAfterMonth = isAfter(checkOut, monthEnd);
        return { ...b, startCol, span, startsBeforeMonth, endsAfterMonth };
      })
      .filter((b) => b.span > 0);
  }, [bookings, monthStart, monthEnd]);

  /* Stats */
  const totalNights = useMemo(() => bookings.reduce((sum, b) =>
    sum + differenceInDays(parseISO(b.check_out), parseISO(b.check_in)), 0), [bookings]);
  const confirmedCount = useMemo(() => bookings.filter(b => b.status === "confirmed").length, [bookings]);

  /* ── Drag handlers ── */
  const handleDragStart = useCallback((e: React.DragEvent, booking: BookingBar, roomId: string) => {
    const dayIdx = differenceInDays(
      isBefore(parseISO(booking.check_in), monthStart) ? monthStart : parseISO(booking.check_in),
      monthStart
    );
    const payload: DragPayload = {
      bookingId: booking.id,
      originalCheckIn: booking.check_in,
      originalCheckOut: booking.check_out,
      originalRoomId: roomId,
      grabDayIdx: dayIdx,
    };
    setDragPayload(payload);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", booking.id);
    // Make the drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  }, [monthStart]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDragPayload(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, roomId: string, dayIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ roomId, dayIdx });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetRoomId: string, targetDayIdx: number) => {
    e.preventDefault();
    if (!dragPayload) return;
    setDropTarget(null);

    const { bookingId, originalCheckIn, originalCheckOut, originalRoomId, grabDayIdx } = dragPayload;
    const dayOffset = targetDayIdx - grabDayIdx;
    const roomChanged = targetRoomId !== originalRoomId;

    // Nothing changed
    if (dayOffset === 0 && !roomChanged) {
      setDragPayload(null);
      return;
    }

    const oldCheckIn = parseISO(originalCheckIn);
    const oldCheckOut = parseISO(originalCheckOut);
    const newCheckIn = addDays(oldCheckIn, dayOffset);
    const newCheckOut = addDays(oldCheckOut, dayOffset);

    const newCheckInStr = format(newCheckIn, "yyyy-MM-dd");
    const newCheckOutStr = format(newCheckOut, "yyyy-MM-dd");

    // Optimistic update
    setBookings(prev => prev.map(b =>
      b.id === bookingId
        ? { ...b, check_in: newCheckInStr, check_out: newCheckOutStr, room_id: targetRoomId, rooms: roomChanged ? (rooms.find(r => r.id === targetRoomId) ? { title: rooms.find(r => r.id === targetRoomId)!.title } : b.rooms) : b.rooms }
        : b
    ));

    setSaving(true);
    const updateData: Record<string, string> = {
      check_in: newCheckInStr,
      check_out: newCheckOutStr,
    };
    if (roomChanged) updateData.room_id = targetRoomId;

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId);

    setSaving(false);
    setDragPayload(null);

    if (error) {
      toast.error("Fehler beim Verschieben der Buchung");
      // Revert
      setBookings(prev => prev.map(b =>
        b.id === bookingId
          ? { ...b, check_in: originalCheckIn, check_out: originalCheckOut, room_id: originalRoomId }
          : b
      ));
    } else {
      setLastMove({
        bookingId,
        prevCheckIn: originalCheckIn,
        prevCheckOut: originalCheckOut,
        prevRoomId: originalRoomId,
      });
      const parts: string[] = [];
      if (dayOffset !== 0) parts.push(`${dayOffset > 0 ? "+" : ""}${dayOffset} Tage`);
      if (roomChanged) parts.push("neues Zimmer");
      toast.success(`Buchung verschoben: ${parts.join(", ")}`);
    }
  }, [dragPayload, rooms]);

  /* Undo last move */
  const handleUndo = useCallback(async () => {
    if (!lastMove) return;
    setSaving(true);
    const updateData: Record<string, string> = {
      check_in: lastMove.prevCheckIn,
      check_out: lastMove.prevCheckOut,
      room_id: lastMove.prevRoomId,
    };
    const { error } = await supabase.from("bookings").update(updateData).eq("id", lastMove.bookingId);
    setSaving(false);
    if (!error) {
      setBookings(prev => prev.map(b =>
        b.id === lastMove.bookingId
          ? { ...b, ...updateData, rooms: rooms.find(r => r.id === lastMove.prevRoomId) ? { title: rooms.find(r => r.id === lastMove.prevRoomId)!.title } : b.rooms }
          : b
      ));
      toast.success("Verschiebung rückgängig gemacht");
      setLastMove(null);
    } else {
      toast.error("Rückgängig machen fehlgeschlagen");
    }
  }, [lastMove, rooms]);

  const isDragging = !!dragPayload;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            Belegungskalender
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Buchungen per Drag & Drop verschieben
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastMove && (
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={saving} className="gap-1.5 text-xs">
              <Undo2 size={14} /> Rückgängig
            </Button>
          )}
          {saving && (
            <span className="text-[11px] font-body text-muted-foreground flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Speichern…
            </span>
          )}
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Calendar size={16} />} label="Zimmer" value={rooms.length} />
        <StatCard icon={<CalendarCheck size={16} />} label="Buchungen" value={bookings.length} />
        <StatCard icon={<Moon size={16} />} label="Nächte gesamt" value={totalNights} />
        <StatCard icon={<User size={16} />} label="Bestätigt" value={confirmedCount} accent />
      </div>

      {/* ── Month Navigation ── */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
          <ChevronLeft size={16} />
        </Button>
        <button onClick={() => setCurrentMonth(new Date())}
          className="font-display text-base font-semibold text-foreground hover:text-accent transition-colors">
          {format(currentMonth, "MMMM yyyy", { locale: de })}
        </button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* ── Drag hint ── */}
      {isDragging && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-2 text-[11px] font-body text-accent-foreground flex items-center gap-2">
          <GripVertical size={14} className="text-accent" />
          Buchung auf eine neue Position oder ein anderes Zimmer ziehen und loslassen
        </div>
      )}

      {/* ── Calendar Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentMonth, "yyyy-MM")}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="p-16 text-center text-muted-foreground font-body text-sm">
              <div className="inline-block w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-3" />
              <p>Kalender wird geladen…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground sticky left-0 bg-card z-20 min-w-[150px] border-r border-border/50">
                      Zimmer
                    </th>
                    {days.map((day) => {
                      const today = isToday(day);
                      const weekend = isWeekend(day);
                      return (
                        <th key={day.toISOString()} className={cn(
                          "p-0 text-center min-w-[38px] relative border-l border-border/20",
                          today && "bg-accent/8",
                          weekend && !today && "bg-muted/30",
                        )}>
                          {today && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-accent rounded-b-full" />}
                          <div className={cn("text-[10px] font-body font-bold pt-2.5",
                            today ? "text-accent" : weekend ? "text-muted-foreground/60" : "text-foreground/80")}>
                            {format(day, "d")}
                          </div>
                          <div className={cn("text-[9px] font-body pb-2",
                            today ? "text-accent/70" : "text-muted-foreground/40")}>
                            {format(day, "EE", { locale: de })}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {rooms.map((room, roomIdx) => {
                    const colorIdx = roomColorMap.get(room.id) ?? 0;
                    const color = roomPalette[colorIdx];
                    const bars = getBookingBars(room.id);

                    return (
                      <tr key={room.id} className={cn(
                        "group relative transition-colors",
                        roomIdx < rooms.length - 1 && "border-b border-border/30",
                        isDragging && dropTarget?.roomId === room.id && "bg-accent/5",
                      )}>
                        {/* Room label */}
                        <td className="p-3 sticky left-0 bg-card z-20 border-r border-border/50 group-hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className={cn("w-2 h-2 rounded-full", color.dot)} />
                            <div>
                              <span className="font-body font-semibold text-foreground text-xs block leading-tight">
                                {room.title}
                              </span>
                              <span className="font-body text-[10px] text-muted-foreground">
                                €{room.price_per_night} · max. {room.max_guests} Gäste
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Day cells */}
                        {days.map((day, dayIndex) => {
                          const today = isToday(day);
                          const weekend = isWeekend(day);
                          const dayIdx = differenceInDays(day, monthStart);
                          const dayBookings = bars.filter(
                            (b) => dayIdx >= b.startCol && dayIdx < b.startCol + b.span
                          );
                          const isBooked = dayBookings.length > 0;
                          const booking = dayBookings[0];
                          const isCheckIn = booking && isSameDay(day, parseISO(booking.check_in));
                          const isCheckOut = booking && isSameDay(day, parseISO(booking.check_out));
                          const isDropHere = isDragging && dropTarget?.roomId === room.id && dropTarget?.dayIdx === dayIdx;
                          const isBeingDragged = isDragging && dragPayload?.bookingId === booking?.id;

                          return (
                            <td
                              key={day.toISOString()}
                              className={cn(
                                "p-0 relative h-[56px] border-l border-border/10 transition-colors",
                                today && "bg-accent/5",
                                weekend && !today && "bg-muted/15",
                                isDropHere && !isBooked && "bg-accent/15 ring-1 ring-inset ring-accent/40",
                              )}
                              onDragOver={(e) => handleDragOver(e, room.id, dayIdx)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, room.id, dayIdx)}
                            >
                              {isBooked && booking ? (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <div
                                      draggable={isCheckIn && !booking.startsBeforeMonth}
                                      onDragStart={(e) => isCheckIn ? handleDragStart(e, booking, room.id) : e.preventDefault()}
                                      onDragEnd={handleDragEnd}
                                      className={cn(
                                        "absolute inset-x-0 top-2 bottom-2 transition-all duration-150",
                                        isBeingDragged ? "opacity-40 scale-y-90" : "hover:scale-y-110 hover:z-10",
                                        "cursor-grab active:cursor-grabbing",
                                        color.bg,
                                        isCheckIn && !booking.startsBeforeMonth && "rounded-l-lg ml-0.5 border-l-[3px]",
                                        isCheckOut && "rounded-r-lg mr-0.5",
                                        isCheckIn && color.border,
                                        !isCheckIn && "border-l-0",
                                      )}
                                    >
                                      {isCheckIn && !booking.startsBeforeMonth && (
                                        <span className={cn(
                                          "absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-body font-bold truncate max-w-[70px] flex items-center gap-1",
                                          color.text,
                                        )}>
                                          <GripVertical size={10} className="shrink-0 opacity-50" />
                                          {booking.guest_name.split(" ")[0]}
                                        </span>
                                      )}
                                    </div>
                                  </PopoverTrigger>
                                  {!isDragging && (
                                    <PopoverContent className="w-72 p-0 shadow-xl border-border" align="start" sideOffset={8}>
                                      <BookingPopover booking={booking} color={color} />
                                    </PopoverContent>
                                  )}
                                </Popover>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {rooms.length === 0 && (
                    <tr>
                      <td colSpan={days.length + 1} className="p-16 text-center">
                        <Calendar size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground font-body text-sm">Keine aktiven Zimmer vorhanden</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-card border border-border rounded-xl px-4 py-3">
        <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground mr-1">Legende</span>
        {rooms.map((room) => {
          const c = roomPalette[roomColorMap.get(room.id) ?? 0];
          return (
            <span key={room.id} className="flex items-center gap-1.5 text-[11px] font-body text-foreground/80">
              <span className={cn("w-3 h-2 rounded-sm", c.bg, "border", c.border)} />
              {room.title}
            </span>
          );
        })}
        <span className="flex items-center gap-1.5 text-[11px] font-body text-muted-foreground ml-auto">
          <span className="w-3 h-2 rounded-sm bg-accent/10 border border-accent/30" /> Heute
        </span>
      </div>

      {/* ── Status Legend ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-body text-muted-foreground">
        <span className="text-[10px] font-semibold uppercase tracking-widest mr-1">Status</span>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", cfg.dotClass)} />
            {cfg.label}
          </span>
        ))}
        <span className="ml-3 flex items-center gap-1.5">
          <GripVertical size={12} /> Drag & Drop aktiv
        </span>
      </div>
    </div>
  );
};

/* ── Stat Card ── */
function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-colors",
      accent && "border-accent/30 bg-accent/5",
    )}>
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center",
        accent ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground",
      )}>
        {icon}
      </div>
      <div>
        <p className="font-display text-xl font-bold text-foreground leading-none">{value}</p>
        <p className="font-body text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── Booking Popover ── */
function BookingPopover({ booking, color }: { booking: Booking; color: typeof roomPalette[number] }) {
  const status = statusConfig[booking.status] ?? statusConfig.pending;
  const nights = differenceInDays(parseISO(booking.check_out), parseISO(booking.check_in));

  return (
    <div className="overflow-hidden">
      <div className={cn("px-4 py-3 flex items-center gap-3", color.bg)}>
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-bold",
          color.bg, color.text, "border", color.border,
        )}>
          {booking.guest_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-body text-sm font-semibold text-foreground truncate">{booking.guest_name}</p>
          <p className="font-body text-[11px] text-muted-foreground truncate">{booking.guest_email}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-body">
          <div className="flex-1 bg-muted/50 rounded-lg p-2.5">
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Anreise</p>
            <p className="font-semibold text-foreground mt-0.5">
              {format(parseISO(booking.check_in), "dd. MMM yyyy", { locale: de })}
            </p>
          </div>
          <ArrowRight size={14} className="text-muted-foreground/40 shrink-0" />
          <div className="flex-1 bg-muted/50 rounded-lg p-2.5">
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Abreise</p>
            <p className="font-semibold text-foreground mt-0.5">
              {format(parseISO(booking.check_out), "dd. MMM yyyy", { locale: de })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-body border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Moon size={12} /> {nights} {nights === 1 ? "Nacht" : "Nächte"}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <User size={12} /> {booking.guests_count}
          </span>
          {booking.total_price && (
            <span className="font-display font-bold text-foreground text-sm">€{booking.total_price}</span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className={cn("w-2 h-2 rounded-full", status.dotClass)} />
          <span className="text-[11px] font-body text-muted-foreground">{status.label}</span>
          {booking.rooms?.title && (
            <span className="ml-auto text-[10px] font-body text-muted-foreground bg-muted rounded-md px-2 py-0.5">
              {booking.rooms.title}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCalendar;
