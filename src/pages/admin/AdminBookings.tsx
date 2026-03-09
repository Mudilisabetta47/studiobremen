import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Eye, QrCode, Copy, Mail, Download, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;
type Room = Tables<"rooms">;

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "Ausstehend", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Bestätigt", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Storniert", className: "bg-red-100 text-red-700" },
  completed: { label: "Abgeschlossen", className: "bg-blue-100 text-blue-700" },
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<(Booking & { rooms: Room | null })[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<(Booking & { rooms: Room | null }) | null>(null);
  const [form, setForm] = useState({
    room_id: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    check_in: "",
    check_out: "",
    guests_count: 1,
    notes: "",
    status: "confirmed" as Enums<"booking_status">,
  });
  const { toast } = useToast();

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, rooms(*)")
      .order("check_in", { ascending: false });
    setBookings((data ?? []) as any);
    setLoading(false);
  };

  const fetchRooms = async () => {
    const { data } = await supabase.from("rooms").select("*").eq("is_active", true).order("title");
    setRooms(data ?? []);
  };

  useEffect(() => { fetchBookings(); fetchRooms(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from("bookings").insert({
      room_id: form.room_id,
      guest_name: form.guest_name,
      guest_email: form.guest_email,
      guest_phone: form.guest_phone || null,
      check_in: form.check_in,
      check_out: form.check_out,
      guests_count: form.guests_count,
      notes: form.notes || null,
      status: form.status,
    });
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Buchung erstellt" });
    setDialogOpen(false);
    fetchBookings();
  };

  const updateStatus = async (id: string, status: Enums<"booking_status">) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchBookings();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Buchungen</h1>
        <Button variant="hero" onClick={() => {
          setForm({ room_id: "", guest_name: "", guest_email: "", guest_phone: "", check_in: "", check_out: "", guests_count: 1, notes: "", status: "confirmed" });
          setDialogOpen(true);
        }} className="gap-2">
          <Plus size={16} /> Neue Buchung
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground font-body">Laden...</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Gast</th>
                <th className="text-left p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Zimmer</th>
                <th className="text-left p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Zeitraum</th>
                <th className="text-left p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-right p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const _st = statusLabels[b.status] ?? statusLabels.pending;
                return (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-body font-semibold text-foreground">{b.guest_name}</p>
                      <p className="text-xs text-muted-foreground">{b.guest_email}</p>
                    </td>
                    <td className="p-4 font-body text-foreground">{b.rooms?.title ?? "–"}</td>
                    <td className="p-4 font-body text-sm text-foreground">
                      {b.check_in} → {b.check_out}
                    </td>
                    <td className="p-4">
                      <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as Enums<"booking_status">)}>
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Ausstehend</SelectItem>
                          <SelectItem value="confirmed">Bestätigt</SelectItem>
                          <SelectItem value="cancelled">Storniert</SelectItem>
                          <SelectItem value="completed">Abgeschlossen</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setDetailBooking(b)}>
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground font-body">Keine Buchungen vorhanden</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Neue Buchung</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Zimmer</label>
              <Select value={form.room_id} onValueChange={(v) => setForm({ ...form, room_id: v })}>
                <SelectTrigger><SelectValue placeholder="Zimmer wählen" /></SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Name</label>
                <Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">E-Mail</label>
                <Input value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Anreise</label>
                <Input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Abreise</label>
                <Input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Gäste</label>
                <Input type="number" min={1} value={form.guests_count} onChange={(e) => setForm({ ...form, guests_count: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Enums<"booking_status"> })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="confirmed">Bestätigt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Notizen</label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button variant="hero" onClick={handleCreate}>Erstellen</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail + QR Support Dialog */}
      <Dialog open={!!detailBooking} onOpenChange={() => setDetailBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Buchungsdetails</DialogTitle>
          </DialogHeader>
          {detailBooking && (
            <DetailWithQR booking={detailBooking} toast={toast} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── QR-Code Support Component ── */

const DetailWithQR = ({ booking, toast }: { booking: Booking & { rooms: Room | null }; toast: any }) => {
  const [copied, setCopied] = useState(false);

  const qrPayload = booking.qr_code_data || JSON.stringify({
    booking_id: booking.id,
    guest: booking.guest_name,
    room: booking.rooms?.title ?? "",
    check_in: booking.check_in,
    check_out: booking.check_out,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "QR-Daten kopiert" });
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent(`Ihre Buchung – ${booking.rooms?.title ?? "Hotel"}`);
    const body = encodeURIComponent(
      `Sehr geehrte/r ${booking.guest_name},\n\nanbei Ihre Buchungsbestätigung:\n\n` +
      `Zimmer: ${booking.rooms?.title ?? "–"}\n` +
      `Anreise: ${booking.check_in}\n` +
      `Abreise: ${booking.check_out}\n` +
      `Gäste: ${booking.guests_count}\n` +
      `Buchungs-ID: ${booking.id}\n\n` +
      `Bitte zeigen Sie beim Check-in Ihren QR-Code vor.\n\nMit freundlichen Grüßen,\nIhr Hotel-Team`
    );
    window.open(`mailto:${booking.guest_email}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("admin-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement("a");
      link.download = `qr-${booking.guest_name.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-5 mt-4">
      {/* Booking details */}
      <div className="grid grid-cols-2 gap-2 font-body text-sm">
        <p className="text-muted-foreground">Gast:</p>
        <p className="text-foreground font-medium">{booking.guest_name}</p>
        <p className="text-muted-foreground">E-Mail:</p>
        <p className="text-foreground">{booking.guest_email}</p>
        <p className="text-muted-foreground">Telefon:</p>
        <p className="text-foreground">{booking.guest_phone || "–"}</p>
        <p className="text-muted-foreground">Zimmer:</p>
        <p className="text-foreground">{booking.rooms?.title ?? "–"}</p>
        <p className="text-muted-foreground">Zeitraum:</p>
        <p className="text-foreground">{booking.check_in} → {booking.check_out}</p>
        <p className="text-muted-foreground">Gäste:</p>
        <p className="text-foreground">{booking.guests_count}</p>
        <p className="text-muted-foreground">Status:</p>
        <p className="text-foreground capitalize">{booking.status}</p>
        {booking.total_price && (
          <>
            <p className="text-muted-foreground">Preis:</p>
            <p className="text-foreground font-semibold">€{booking.total_price}</p>
          </>
        )}
        {booking.notes && (
          <>
            <p className="text-muted-foreground">Notizen:</p>
            <p className="text-foreground">{booking.notes}</p>
          </>
        )}
      </div>

      {/* QR Code Support Section */}
      <div className="border-t border-border pt-5">
        <h4 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
          <QrCode size={16} className="text-accent" />
          QR-Code für Check-in
        </h4>
        <div className="flex gap-5 items-start">
          <div className="bg-background p-3 rounded-lg border border-border shadow-sm">
            <QRCodeSVG id="admin-qr-svg" value={qrPayload} size={140} />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs font-body text-muted-foreground mb-3">
              Falls der Gast seinen QR-Code nicht erhalten hat, können Sie diesen herunterladen oder per E-Mail erneut senden.
            </p>
            <Button variant="outline" size="sm" className="w-full gap-2 justify-start" onClick={handleDownloadQR}>
              <Download size={14} /> QR-Code herunterladen
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-2 justify-start" onClick={handleEmailSupport}>
              <Mail size={14} /> Per E-Mail an Gast senden
            </Button>
            <Button variant="ghost" size="sm" className="w-full gap-2 justify-start" onClick={handleCopy}>
              {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
              {copied ? "Kopiert!" : "QR-Daten kopieren"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
