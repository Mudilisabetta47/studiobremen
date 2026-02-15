import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

type Room = Tables<"rooms">;

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    long_description: "",
    price_per_night: 0,
    max_guests: 2,
    size: "",
    amenities: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const fetchRooms = async () => {
    const { data } = await supabase.from("rooms").select("*").order("sort_order");
    setRooms(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  const openCreate = () => {
    setEditingRoom(null);
    setForm({ title: "", slug: "", description: "", long_description: "", price_per_night: 0, max_guests: 2, size: "", amenities: "" });
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      title: room.title,
      slug: room.slug,
      description: room.description ?? "",
      long_description: room.long_description ?? "",
      price_per_night: room.price_per_night,
      max_guests: room.max_guests,
      size: room.size ?? "",
      amenities: (room.amenities ?? []).join(", "),
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const amenitiesArr = form.amenities.split(",").map((a) => a.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: form.description,
      long_description: form.long_description,
      price_per_night: form.price_per_night,
      max_guests: form.max_guests,
      size: form.size,
      amenities: amenitiesArr,
    };

    let roomId = editingRoom?.id;

    if (editingRoom) {
      const { error } = await supabase.from("rooms").update(payload).eq("id", editingRoom.id);
      if (error) { toast({ title: "Fehler", description: error.message, variant: "destructive" }); return; }
    } else {
      const { data, error } = await supabase.from("rooms").insert(payload).select().single();
      if (error) { toast({ title: "Fehler", description: error.message, variant: "destructive" }); return; }
      roomId = data.id;
    }

    // Upload image
    if (imageFile && roomId) {
      const ext = imageFile.name.split(".").pop();
      const path = `${roomId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("room-images").upload(path, imageFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("room-images").getPublicUrl(path);
        await supabase.from("room_images").insert({
          room_id: roomId,
          image_url: urlData.publicUrl,
          is_primary: true,
          alt_text: form.title,
        });
      }
    }

    toast({ title: editingRoom ? "Zimmer aktualisiert" : "Zimmer erstellt" });
    setDialogOpen(false);
    fetchRooms();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Zimmer wirklich löschen?")) return;
    await supabase.from("rooms").delete().eq("id", id);
    toast({ title: "Zimmer gelöscht" });
    fetchRooms();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Zimmerverwaltung</h1>
        <Button variant="hero" onClick={openCreate} className="gap-2">
          <Plus size={16} /> Neues Zimmer
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground font-body">Laden...</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Zimmer</th>
                <th className="text-left p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Preis</th>
                <th className="text-left p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Gäste</th>
                <th className="text-left p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-right p-4 text-xs font-body uppercase tracking-wider text-muted-foreground">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <p className="font-display font-semibold text-foreground">{room.title}</p>
                    <p className="text-xs text-muted-foreground font-body">{room.size}</p>
                  </td>
                  <td className="p-4 font-body text-foreground">€{room.price_per_night}/Nacht</td>
                  <td className="p-4 font-body text-foreground">{room.max_guests}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-body ${room.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {room.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(room)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(room.id)} className="hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground font-body">
                    Noch keine Zimmer vorhanden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingRoom ? "Zimmer bearbeiten" : "Neues Zimmer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Titel</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
              </div>
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Kurzbeschreibung</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Ausführliche Beschreibung</label>
              <Textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Preis/Nacht (€)</label>
                <Input type="number" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Max. Gäste</label>
                <Input type="number" value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Größe</label>
                <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="z.B. 28 m²" />
              </div>
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Ausstattung (kommagetrennt)</label>
              <Input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WLAN, Minibar, Safe" />
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">Bild hochladen</label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button variant="hero" onClick={handleSave}>Speichern</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRooms;
