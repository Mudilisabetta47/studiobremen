import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import {
  LayoutDashboard, BedDouble, CalendarDays, BookOpen,
  LogOut, ChevronLeft, Settings, BarChart3,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Übersicht",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/stats", label: "Statistiken", icon: BarChart3 },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { to: "/admin/rooms", label: "Zimmer", icon: BedDouble },
      { to: "/admin/bookings", label: "Buchungen", icon: BookOpen },
      { to: "/admin/calendar", label: "Kalender", icon: CalendarDays },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/settings", label: "Einstellungen", icon: Settings },
    ],
  },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { loading, isAdmin, signOut } = useAdmin();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-body text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-primary-foreground/10">
        <h1 className="font-display text-lg font-bold tracking-wide">
          STUDIO <span className="text-accent">BREMEN</span>
        </h1>
        <p className="text-[10px] text-primary-foreground/40 font-body mt-0.5 uppercase tracking-widest">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-body uppercase tracking-widest text-primary-foreground/30">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-body transition-all",
                      active
                        ? "bg-accent/15 text-accent font-medium"
                        : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-primary-foreground/10 space-y-1">
        <Link to="/" onClick={() => setSidebarOpen(false)}>
          <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/50 hover:text-primary-foreground gap-2 text-xs">
            <ChevronLeft size={14} /> Zur Website
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/50 hover:text-destructive gap-2 text-xs" onClick={signOut}>
          <LogOut size={14} /> Abmelden
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-primary text-primary-foreground flex-col flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-primary text-primary-foreground flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 lg:px-8 sticky top-0 z-40">
          <Button variant="ghost" size="sm" className="lg:hidden mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </Button>
          <div className="flex-1" />
          <p className="text-xs font-body text-muted-foreground">
            Eingeloggt als Admin
          </p>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
