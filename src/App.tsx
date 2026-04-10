import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import GuestLogin from "./pages/GuestLogin";
import GuestRegister from "./pages/GuestRegister";
import MyBookings from "./pages/MyBookings";
import BookingConfirmed from "./pages/BookingConfirmed";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStats from "./pages/admin/AdminStats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/zimmer" element={<Layout><Rooms /></Layout>} />
          <Route path="/zimmer/:id" element={<Layout><RoomDetail /></Layout>} />
          <Route path="/kontakt" element={<Layout><Contact /></Layout>} />
          <Route path="/impressum" element={<Layout><Legal /></Layout>} />
          <Route path="/datenschutz" element={<Layout><Legal /></Layout>} />
          <Route path="/agb" element={<Layout><Legal /></Layout>} />

          {/* Guest auth routes */}
          <Route path="/login" element={<GuestLogin />} />
          <Route path="/registrieren" element={<GuestRegister />} />
          <Route path="/meine-buchungen" element={<MyBookings />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/rooms" element={<AdminLayout><AdminRooms /></AdminLayout>} />
          <Route path="/admin/bookings" element={<AdminLayout><AdminBookings /></AdminLayout>} />
          <Route path="/admin/calendar" element={<AdminLayout><AdminCalendar /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          <Route path="/admin/stats" element={<AdminLayout><AdminStats /></AdminLayout>} />

          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
