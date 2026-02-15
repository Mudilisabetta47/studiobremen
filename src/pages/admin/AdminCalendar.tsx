import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isWithinInterval, parseISO } from "date-fns";
import { de } from "date-fns/locale";
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
    return bookings.filter((b) => {
      if (b.room_id !== roomId) return false;
      const checkIn = parseISO(b.check_in);
      const checkOut = parseISO(b.check_out);
      return isWithinInterval(day, { start: checkIn, end: checkOut });
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Verfügbarkeitskalender</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft size={16} />
          </Button>
          <span className="font-display text-lg font-semibold text-foreground min-w-[160px] text-center">
            {format(currentMonth, "MMMM yyyy", { locale: de })}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left text-xs font-body uppercase tracking-wider text-muted-foreground sticky left-0 bg-card z-10 min-w-[140px]">
                Zimmer
              </th>
              {days.map((day) => (
                <th key={day.toISOString()} className="p-1 text-center text-xs font-body text-muted-foreground min-w-[36px]">
                  <div>{format(day, "dd")}</div>
                  <div className="text-[10px]">{format(day, "EEE", { locale: de })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-border last:border-0">
                <td className="p-3 font-body font-medium text-foreground text-sm sticky left-0 bg-card z-10">
                  {room.title}
                </td>
                {days.map((day) => {
                  const dayBookings = getBookingsForRoomAndDay(room.id, day);
                  const isBooked = dayBookings.length > 0;
                  return (
                    <td
                      key={day.toISOString()}
                      className={`p-1 text-center ${isBooked ? "bg-destructive/20" : "bg-green-50"}`}
                      title={isBooked ? dayBookings.map((b) => b.guest_name).join(", ") : "Verfügbar"}
                    >
                      <div className={`w-6 h-6 rounded-sm mx-auto flex items-center justify-center text-[10px] font-body ${isBooked ? "bg-destructive/30 text-destructive" : "text-green-600"}`}>
                        {isBooked ? "●" : "○"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-6 mt-4 text-xs font-body text-muted-foreground">
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-50 border border-green-200"></span> Verfügbar</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-destructive/20 border border-destructive/30"></span> Gebucht</span>
      </div>
    </div>
  );
};

export default AdminCalendar;
