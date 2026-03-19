import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BedDouble, ImageIcon, MapPin } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

type Room = Tables<"rooms">;

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({
    title: "", slug: "", description: "", long_description: "",
    price_per_night: 0, max_guests: 2, size: "", amenities: "", location: "",
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
    setForm({ title: "", slug: "", description: "", long_description: "", price_per_night: 0, max_guests: 2, size: "", amenities: "", location: "Bremen-Mitte" });
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      title: room.title, slug: room.slug, description: room.description ?? "",
      long_description: room.long_description ?? "", price_per_night: room.price_per_night,
      max_guests: room.max_guests, size: room.size ?? "",
      amenities: (room.amenities ?? []).join(", "),
      location: (room as any).location ?? "Bremen-Mitte",
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const amenitiesArr = form.amenities.split(",").map(a => a.trim()).filter(Boolean);
    const payload: Record<string, any> = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: form.description, long_description: form.long_description,
      price_per_night: form.price_per_night, max_guests: form.max_guests,
      size: form.size, amenities: amenitiesArr,
      location: form.location || "Bremen-Mitte",
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

    if (imageFile && roomId) {
      const ext = imageFile.name.split(".").pop();
      const path = `${roomId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("room-images").upload(path, imageFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("room-images").getPublicUrl(path);
        await supabase.from("room_images").insert({
          room_id: roomId, image_url: urlData.publicUrl, is_primary: true, alt_text: form.title,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Zimmerverwaltung</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">{rooms.length} Zimmer insgesamt</p>
        </div>
        <Button variant="hero" onClick={openCreate} className="gap-2 shadow-md shadow-accent/10">
          <Plus size={16} /> Neues Zimmer
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/40 animate-pulse rounded-xl" />)}
        </div>
      ) : rooms.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card border border-border/60 rounded-xl p-12 text-center">
          <BedDouble size={32} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-body">Noch keine Zimmer vorhanden</p>
          <Button variant="hero" onClick={openCreate} className="mt-4 gap-2">
            <Plus size={16} /> Erstes Zimmer erstellen
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:border-accent/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <BedDouble size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-foreground text-[15px]">{room.title}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {room.size} · max. {room.max_guests} Gäste · €{room.price_per_night}/Nacht
                </p>
              </div>
              {/* Location badge */}
              {(room as any).location && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-body font-medium bg-accent/10 text-accent">
                  <MapPin size={10} />
                  {(room as any).location}
                </span>
              )}
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-body font-medium ${
                room.is_active
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-destructive/10 text-destructive"
              }`}>
                {room.is_active ? "Aktiv" : "Inaktiv"}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => openEdit(room)} className="h-8 w-8 p-0 hover:bg-accent/10 hover:text-accent">
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(room.id)} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
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
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Titel</label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Slug</label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
              </div>
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Kurzbeschreibung</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Ausführliche Beschreibung</label>
              <Textarea value={form.long_description} onChange={e => setForm({ ...form, long_description: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Preis/Nacht (€)</label>
                  <Input type="number" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Max. Gäste</label>
                  <Input type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Größe</label>
                  <Input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="z.B. 28 m²" />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-accent mb-1.5 flex items-center gap-1.5">
                    <MapPin size={12} />
                    Standort
                  </label>
                  <Input
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="z.B. Bremen-Mitte"
                    className="border-accent/30 focus-visible:ring-accent"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Ausstattung (kommagetrennt)</label>
              <Input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WLAN, Minibar, Safe" />
            </div>
            <div>
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Bild hochladen</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/30 transition-colors cursor-pointer"
                onClick={() => document.getElementById("room-image-input")?.click()}>
                <ImageIcon size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground font-body">
                  {imageFile ? imageFile.name : "Klicken zum Hochladen"}
                </p>
              </div>
              <input id="room-image-input" type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button variant="hero" onClick={handleSave} className="shadow-md shadow-accent/10">Speichern</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRooms;
