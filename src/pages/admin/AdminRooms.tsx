import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BedDouble, ImageIcon, MapPin, Link2, X, Star } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

type Room = Tables<"rooms">;
type RoomImage = { id: string; image_url: string; is_primary: boolean | null; alt_text: string | null; sort_order: number | null };

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({
    title: "", slug: "", description: "", long_description: "",
    price_per_night: 0, max_guests: 2, size: "", amenities: "", location: "",
    smoobu_iframe_id: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [existingImages, setExistingImages] = useState<RoomImage[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchRooms = async () => {
    const { data } = await supabase.from("rooms").select("*").order("sort_order");
    setRooms(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  const fetchExistingImages = async (roomId: string) => {
    const { data } = await supabase.from("room_images").select("*").eq("room_id", roomId).order("sort_order");
    setExistingImages((data ?? []) as RoomImage[]);
  };

  const openCreate = () => {
    setEditingRoom(null);
    setForm({ title: "", slug: "", description: "", long_description: "", price_per_night: 0, max_guests: 2, size: "", amenities: "", location: "Bremen-Mitte", smoobu_iframe_id: "" });
    setImageFiles([]);
    setImageUrls([]);
    setNewImageUrl("");
    setExistingImages([]);
    setDialogOpen(true);
  };

  const openEdit = async (room: Room) => {
    setEditingRoom(room);
    setForm({
      title: room.title, slug: room.slug, description: room.description ?? "",
      long_description: room.long_description ?? "", price_per_night: room.price_per_night,
      max_guests: room.max_guests, size: room.size ?? "",
      amenities: (room.amenities ?? []).join(", "),
      location: room.location ?? "Bremen-Mitte",
      smoobu_iframe_id: room.smoobu_iframe_id ?? "",
    });
    setImageFiles([]);
    setImageUrls([]);
    setNewImageUrl("");
    await fetchExistingImages(room.id);
    setDialogOpen(true);
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/.test(url)) {
      toast({ title: "Ungültige URL", description: "Bitte eine gültige Bild-URL eingeben.", variant: "destructive" });
      return;
    }
    setImageUrls(prev => [...prev, url]);
    setNewImageUrl("");
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId: string) => {
    await supabase.from("room_images").delete().eq("id", imageId);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    toast({ title: "Bild entfernt" });
  };

  const setPrimaryImage = async (imageId: string, roomId: string) => {
    // unset all, then set the chosen one
    await supabase.from("room_images").update({ is_primary: false }).eq("room_id", roomId);
    await supabase.from("room_images").update({ is_primary: true }).eq("id", imageId);
    setExistingImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
    toast({ title: "Hauptbild gesetzt" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const amenitiesArr = form.amenities.split(",").map(a => a.trim()).filter(Boolean);
      const payload = {
        title: form.title,
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: form.description, long_description: form.long_description,
        price_per_night: form.price_per_night, max_guests: form.max_guests,
        size: form.size, amenities: amenitiesArr,
        location: form.location || "Bremen-Mitte",
        smoobu_iframe_id: form.smoobu_iframe_id.trim() || null,
      };

      let roomId = editingRoom?.id;

      if (editingRoom) {
        const { error } = await supabase.from("rooms").update(payload).eq("id", editingRoom.id);
        if (error) { toast({ title: "Fehler beim Aktualisieren", description: error.message, variant: "destructive" }); setSaving(false); return; }
      } else {
        const { data, error } = await supabase.from("rooms").insert(payload).select().single();
        if (error) { toast({ title: "Fehler beim Erstellen", description: error.message, variant: "destructive" }); setSaving(false); return; }
        roomId = data.id;
      }

      if (roomId) {
        const hasPrimaryExisting = existingImages.some(img => img.is_primary);
        const isFirstImage = !hasPrimaryExisting && existingImages.length === 0;
        let uploadErrors: string[] = [];

        // Save URL-based images
        for (let i = 0; i < imageUrls.length; i++) {
          const { error: imgError } = await supabase.from("room_images").insert({
            room_id: roomId,
            image_url: imageUrls[i],
            is_primary: isFirstImage && i === 0 && imageFiles.length === 0,
            alt_text: form.title,
            sort_order: existingImages.length + i,
          });
          if (imgError) {
            console.error("Image URL save error:", imgError);
            uploadErrors.push(`URL ${i + 1}: ${imgError.message}`);
          }
        }

        // Upload file-based images
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const safeName = `${Date.now()}_${i}.${ext}`;
          const path = `${payload.slug}/${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from("room-images")
            .upload(path, file, { cacheControl: "3600", upsert: false });

          if (uploadError) {
            console.error("Storage upload error:", uploadError);
            uploadErrors.push(`Datei "${file.name}": ${uploadError.message}`);
            continue;
          }

          const { data: urlData } = supabase.storage.from("room-images").getPublicUrl(path);
          const { error: imgError } = await supabase.from("room_images").insert({
            room_id: roomId,
            image_url: urlData.publicUrl,
            is_primary: isFirstImage && imageUrls.length === 0 && i === 0,
            alt_text: form.title,
            sort_order: existingImages.length + imageUrls.length + i,
          });
          if (imgError) {
            console.error("Image record save error:", imgError);
            uploadErrors.push(`DB-Eintrag "${file.name}": ${imgError.message}`);
          }
        }

        if (uploadErrors.length > 0) {
          toast({
            title: "Bilder-Fehler",
            description: uploadErrors.join("\n"),
            variant: "destructive",
          });
        }
      }

      toast({ title: editingRoom ? "Zimmer aktualisiert" : "Zimmer erstellt" });
      setSaving(false);
      setDialogOpen(false);
      fetchRooms();
    } catch (err: any) {
      console.error("Save error:", err);
      toast({ title: "Unerwarteter Fehler", description: err?.message || "Bitte erneut versuchen.", variant: "destructive" });
      setSaving(false);
    }
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
              {room.location && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-body font-medium bg-accent/10 text-accent">
                  <MapPin size={10} />
                  {room.location}
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
              <label className="text-xs font-body uppercase tracking-wider text-accent mb-1.5 flex items-center gap-1.5">
                <Link2 size={12} />
                Smoobu Apartment-ID
              </label>
              <Input
                value={form.smoobu_iframe_id}
                onChange={e => setForm({ ...form, smoobu_iframe_id: e.target.value })}
                placeholder="z.B. 2064505"
                className="border-accent/30 focus-visible:ring-accent"
              />
              <p className="text-[11px] text-muted-foreground font-body mt-1">
                Die ID aus der Smoobu-Iframe-URL (z.B. <code>.../iframe/800140/<strong>2064505</strong></code>). Leer lassen, um das interne Buchungsformular zu zeigen.
              </p>
            </div>

            {/* === BILDER SECTION === */}
            <div className="space-y-3">
              <label className="text-xs font-body uppercase tracking-wider text-muted-foreground block">Bilder</label>

              {/* Existing images (when editing) */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-body mb-2">Vorhandene Bilder</p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map(img => (
                      <div key={img.id} className="relative group/img rounded-lg overflow-hidden border border-border">
                        <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-20 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-white hover:bg-white/20"
                            title="Als Hauptbild setzen"
                            onClick={() => editingRoom && setPrimaryImage(img.id, editingRoom.id)}
                          >
                            <Star size={14} className={img.is_primary ? "fill-yellow-400 text-yellow-400" : ""} />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-white hover:bg-destructive/50"
                            onClick={() => deleteExistingImage(img.id)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/90 text-white font-body font-medium">
                            Haupt
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add by URL */}
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5 flex items-center gap-1">
                  <Link2 size={12} /> Bild-URL hinzufügen
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/bild.jpg"
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                  />
                  <Button variant="outline" size="sm" onClick={addImageUrl} className="shrink-0">
                    <Plus size={14} />
                  </Button>
                </div>
              </div>

              {/* Queued URL images */}
              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group/url rounded-lg overflow-hidden border border-accent/30 w-20 h-20">
                      <img src={url} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                      <button
                        onClick={() => removeImageUrl(i)}
                        className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload multiple files */}
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5 flex items-center gap-1">
                  <ImageIcon size={12} /> Dateien hochladen (mehrere möglich)
                </p>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-accent/30 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("room-image-input")?.click()}
                >
                  <ImageIcon size={20} className="mx-auto text-muted-foreground/40 mb-1" />
                  <p className="text-xs text-muted-foreground font-body">
                    {imageFiles.length > 0 ? `${imageFiles.length} Datei(en) ausgewählt` : "Klicken zum Hochladen"}
                  </p>
                </div>
                <input
                  id="room-image-input" type="file" accept="image/*" multiple className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files ?? []);
                    setImageFiles(prev => [...prev, ...files]);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Queued file images */}
              {imageFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imageFiles.map((file, i) => (
                    <div key={i} className="relative group/file rounded-lg overflow-hidden border border-border w-20 h-20">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button variant="hero" onClick={handleSave} disabled={saving} className="shadow-md shadow-accent/10">
                {saving ? "Speichert…" : "Speichern"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRooms;
