import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Bell, Shield, Palette, CreditCard, Link2, Save, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    hotelName: "Studio Bremen",
    email: "info@mep-agentur.de",
    phone: "",
    address: "Bremen, Deutschland",
    currency: "EUR",
    timezone: "Europe/Berlin",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    maxAdvanceBookingDays: 365,
    minStay: 1,
    cancellationHours: 48,
    autoConfirm: false,
    emailNotifications: true,
    bookingNotifications: true,
    smoobuSync: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    toast({ title: "Einstellungen gespeichert" });
    setSaving(false);
  };

  const tabs = [
    { id: "general", label: "Allgemein", icon: Globe },
    { id: "booking", label: "Buchungen", icon: CreditCard },
    { id: "notifications", label: "Benachrichtigungen", icon: Bell },
    { id: "integrations", label: "Integrationen", icon: Link2 },
    { id: "appearance", label: "Darstellung", icon: Palette },
    { id: "security", label: "Sicherheit", icon: Shield },
  ];

  const SettingsToggle = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-xl hover:bg-muted/30 transition-colors">
      <div>
        <p className="font-body font-medium text-sm text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground font-body mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Einstellungen</h1>
        <p className="font-body text-sm text-muted-foreground mt-0.5">Hotel- und Systemkonfiguration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tabs */}
        <nav className="lg:w-52 flex-shrink-0">
          <div className="bg-card border border-border/60 rounded-xl p-1.5 space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-body transition-all text-left relative",
                  activeTab === id
                    ? "bg-accent text-accent-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-card border border-border/60 rounded-xl p-6"
        >
          {activeTab === "general" && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Allgemeine Einstellungen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Hotelname", key: "hotelName" as const },
                  { label: "E-Mail", key: "email" as const },
                  { label: "Telefon", key: "phone" as const, placeholder: "+49 ..." },
                  { label: "Adresse", key: "address" as const },
                  { label: "Währung", key: "currency" as const },
                  { label: "Zeitzone", key: "timezone" as const },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</label>
                    <Input value={settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.value })} placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Buchungseinstellungen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Check-in Zeit</label>
                  <Input type="time" value={settings.checkInTime} onChange={e => setSettings({ ...settings, checkInTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Check-out Zeit</label>
                  <Input type="time" value={settings.checkOutTime} onChange={e => setSettings({ ...settings, checkOutTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Max. Vorlaufzeit (Tage)</label>
                  <Input type="number" value={settings.maxAdvanceBookingDays} onChange={e => setSettings({ ...settings, maxAdvanceBookingDays: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Mindestaufenthalt (Nächte)</label>
                  <Input type="number" min={1} value={settings.minStay} onChange={e => setSettings({ ...settings, minStay: Number(e.target.value) })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Stornierungsfrist (Stunden)</label>
                  <Input type="number" value={settings.cancellationHours} onChange={e => setSettings({ ...settings, cancellationHours: Number(e.target.value) })} />
                </div>
              </div>
              <SettingsToggle
                label="Automatische Bestätigung"
                desc="Buchungen automatisch bestätigen ohne manuelle Prüfung"
                checked={settings.autoConfirm}
                onChange={v => setSettings({ ...settings, autoConfirm: v })}
              />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Benachrichtigungen</h2>
              <div className="space-y-3">
                <SettingsToggle
                  label="E-Mail-Benachrichtigungen"
                  desc="Benachrichtigungen per E-Mail erhalten"
                  checked={settings.emailNotifications}
                  onChange={v => setSettings({ ...settings, emailNotifications: v })}
                />
                <SettingsToggle
                  label="Buchungs-Alerts"
                  desc="Sofortige Benachrichtigung bei neuen Buchungen"
                  checked={settings.bookingNotifications}
                  onChange={v => setSettings({ ...settings, bookingNotifications: v })}
                />
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Integrationen</h2>
              <div className="border border-border/60 rounded-xl overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10 text-accent"><Link2 size={18} /></div>
                    <div>
                      <p className="font-body font-medium text-sm text-foreground">Smoobu Channel Manager</p>
                      <p className="text-[11px] text-muted-foreground font-body">Buchungen & Verfügbarkeit synchronisieren</p>
                    </div>
                  </div>
                  <Switch checked={settings.smoobuSync} onCheckedChange={v => setSettings({ ...settings, smoobuSync: v })} />
                </div>
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-2 text-[11px] font-body text-emerald-600 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-3 py-2">
                    <Check size={13} /> Verbunden – Webhook aktiv
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Darstellung</h2>
              <div className="bg-muted/20 border border-border/40 rounded-xl p-6 text-center">
                <Palette size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground font-body">
                  Designanpassungen können über die Zimmer- und Seitenverwaltung vorgenommen werden.
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Sicherheit</h2>
              <div className="bg-muted/20 border border-border/40 rounded-xl p-5 space-y-4">
                <div>
                  <p className="font-body font-medium text-sm text-foreground mb-0.5">Passwort ändern</p>
                  <p className="text-[11px] text-muted-foreground font-body mb-3">Aktualisieren Sie Ihr Admin-Passwort</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input type="password" placeholder="Neues Passwort" />
                    <Input type="password" placeholder="Passwort bestätigen" />
                  </div>
                </div>
              </div>
              <div className="bg-muted/20 border border-border/40 rounded-xl p-5">
                <p className="font-body font-medium text-sm text-foreground">Aktive Sitzungen</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-[11px] text-muted-foreground font-body">Derzeit angemeldet als Admin</p>
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="mt-8 pt-5 border-t border-border/40 flex justify-end">
            <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2 shadow-md shadow-accent/10">
              <Save size={14} />
              {saving ? "Speichern..." : "Einstellungen speichern"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
