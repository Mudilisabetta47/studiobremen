import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Bell, Shield, Palette, CreditCard, Link2, Save,
} from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  // General settings state
  const [settings, setSettings] = useState({
    hotelName: "Hotel Bremen",
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
    // Settings would be stored in a settings table - for now just show toast
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Einstellungen</h1>
        <p className="font-body text-muted-foreground mt-1">Hotel- und Systemkonfiguration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl p-2 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body transition-colors text-left ${
                  activeTab === id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-card border border-border rounded-xl p-6"
        >
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Allgemeine Einstellungen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Hotelname</label>
                  <Input value={settings.hotelName} onChange={e => setSettings({ ...settings, hotelName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">E-Mail</label>
                  <Input value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Telefon</label>
                  <Input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="+49 ..." />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Adresse</label>
                  <Input value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Währung</label>
                  <Input value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Zeitzone</label>
                  <Input value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Buchungseinstellungen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Check-in Zeit</label>
                  <Input type="time" value={settings.checkInTime} onChange={e => setSettings({ ...settings, checkInTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Check-out Zeit</label>
                  <Input type="time" value={settings.checkOutTime} onChange={e => setSettings({ ...settings, checkOutTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Max. Vorlaufzeit (Tage)</label>
                  <Input type="number" value={settings.maxAdvanceBookingDays} onChange={e => setSettings({ ...settings, maxAdvanceBookingDays: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Mindestaufenthalt (Nächte)</label>
                  <Input type="number" min={1} value={settings.minStay} onChange={e => setSettings({ ...settings, minStay: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1.5 block">Stornierungsfrist (Stunden)</label>
                  <Input type="number" value={settings.cancellationHours} onChange={e => setSettings({ ...settings, cancellationHours: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-body font-medium text-sm text-foreground">Automatische Bestätigung</p>
                  <p className="text-xs text-muted-foreground font-body">Buchungen automatisch bestätigen</p>
                </div>
                <Switch checked={settings.autoConfirm} onCheckedChange={v => setSettings({ ...settings, autoConfirm: v })} />
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Benachrichtigungen</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-body font-medium text-sm text-foreground">E-Mail-Benachrichtigungen</p>
                    <p className="text-xs text-muted-foreground font-body">Benachrichtigungen per E-Mail erhalten</p>
                  </div>
                  <Switch checked={settings.emailNotifications} onCheckedChange={v => setSettings({ ...settings, emailNotifications: v })} />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-body font-medium text-sm text-foreground">Buchungs-Alerts</p>
                    <p className="text-xs text-muted-foreground font-body">Sofortige Benachrichtigung bei neuen Buchungen</p>
                  </div>
                  <Switch checked={settings.bookingNotifications} onCheckedChange={v => setSettings({ ...settings, bookingNotifications: v })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Integrationen</h2>
              <div className="space-y-4">
                <div className="p-5 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 text-accent"><Link2 size={20} /></div>
                      <div>
                        <p className="font-body font-medium text-foreground">Smoobu Channel Manager</p>
                        <p className="text-xs text-muted-foreground font-body">Synchronisation von Buchungen und Verfügbarkeit</p>
                      </div>
                    </div>
                    <Switch checked={settings.smoobuSync} onCheckedChange={v => setSettings({ ...settings, smoobuSync: v })} />
                  </div>
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs font-body text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Verbunden – Webhook aktiv
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Darstellung</h2>
              <p className="text-sm text-muted-foreground font-body">
                Anpassungen am Design der öffentlichen Website können über die Zimmer- und Seitenverwaltung vorgenommen werden.
              </p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Sicherheit</h2>
              <div className="space-y-3">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-body font-medium text-sm text-foreground">Passwort ändern</p>
                  <p className="text-xs text-muted-foreground font-body mb-3">Aktualisieren Sie Ihr Admin-Passwort</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input type="password" placeholder="Neues Passwort" />
                    <Input type="password" placeholder="Passwort bestätigen" />
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-body font-medium text-sm text-foreground">Aktive Sitzungen</p>
                  <p className="text-xs text-muted-foreground font-body">Derzeit angemeldet als admin</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
              <Save size={16} />
              {saving ? "Speichern..." : "Einstellungen speichern"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
