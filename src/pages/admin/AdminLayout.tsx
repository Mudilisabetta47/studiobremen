import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BedDouble, CalendarDays, BookOpen,
  LogOut, ChevronLeft, Settings, BarChart3, Menu,
  Sparkles,
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 border-2 border-accent/30 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground font-body text-sm tracking-wide">Laden...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Sparkles size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold tracking-wide leading-tight">
              STUDIO <span className="text-accent">BREMEN</span>
            </h1>
            <p className="text-[9px] text-primary-foreground/30 font-body uppercase tracking-[0.2em]">Admin Panel</p>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-body font-medium uppercase tracking-[0.15em] text-primary-foreground/25">
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
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-body transition-all duration-200",
                      active
                        ? "bg-accent/10 text-accent font-medium shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.15)]"
                        : "text-primary-foreground/50 hover:text-primary-foreground/80 hover:bg-primary-foreground/5"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon size={16} className={active ? "text-accent" : ""} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent" />

      {/* Footer */}
      <div className="p-3 space-y-0.5">
        <Link to="/" onClick={() => setSidebarOpen(false)}>
          <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/40 hover:text-primary-foreground hover:bg-primary-foreground/5 gap-2.5 text-xs h-9 rounded-lg">
            <ChevronLeft size={14} /> Zur Website
          </Button>
        </Link>
        <Button
          variant="ghost" size="sm"
          className="w-full justify-start text-primary-foreground/40 hover:text-destructive hover:bg-destructive/10 gap-2.5 text-xs h-9 rounded-lg"
          onClick={signOut}
        >
          <LogOut size={14} /> Abmelden
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] bg-gradient-to-b from-primary to-primary/95 text-primary-foreground flex-col flex-shrink-0 sticky top-0 h-screen border-r border-primary-foreground/5">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-[240px] bg-gradient-to-b from-primary to-primary/95 text-primary-foreground flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-[52px] border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-4 lg:px-8 sticky top-0 z-40">
          <Button variant="ghost" size="sm" className="lg:hidden mr-3 h-8 w-8 p-0" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-body text-muted-foreground">Admin</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-5 lg:p-8 max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
