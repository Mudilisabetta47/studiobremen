import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  BookOpen,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/rooms", label: "Zimmer", icon: BedDouble },
  { to: "/admin/bookings", label: "Buchungen", icon: BookOpen },
  { to: "/admin/calendar", label: "Kalender", icon: CalendarDays },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { loading, isAdmin, signOut } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body animate-pulse">Laden...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-primary-foreground/10">
          <h1 className="font-display text-xl font-bold">
            HOTEL <span className="text-accent">BREMEN</span>
          </h1>
          <p className="text-xs text-primary-foreground/50 font-body mt-1">Admin-Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-body transition-colors ${
                location.pathname === to
                  ? "bg-sidebar-accent text-accent"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10 space-y-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground gap-2">
              <ChevronLeft size={16} /> Zur Website
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/70 hover:text-destructive gap-2" onClick={signOut}>
            <LogOut size={16} /> Abmelden
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
