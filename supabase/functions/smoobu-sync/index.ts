import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMOOBU_API_BASE = "https://login.smoobu.com/api";

// Basic in-memory rate limit (per cold-start instance). Sufficient as a soft
// guard against trivial spam; production-grade limiting would require a shared store.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max booking attempts
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count += 1;
  return true;
}

// Lightweight validators (avoids extra deps)
const isString = (v: unknown, max = 500): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= max;
const isISODate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isEmail = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 255;
const isUUID = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const smoobuApiKey = Deno.env.get("SMOOBU_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Helper: identify caller (if any) from JWT
  async function getCallerUserId(): Promise<string | null> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.replace("Bearer ", "");
    try {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await userClient.auth.getUser(token);
      if (error || !data?.user) return null;
      return data.user.id;
    } catch {
      return null;
    }
  }

  async function isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return !!data;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, ...payload } = body ?? {};

    if (!isString(action, 50)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Helper: DB-level overlap check ──
    async function checkDbOverlap(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
      const { data } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", roomId)
        .in("status", ["pending", "confirmed"])
        .lt("check_in", checkOut)
        .gt("check_out", checkIn)
        .limit(1);
      return (data?.length ?? 0) > 0;
    }

    // ── Check availability ──
    if (action === "check-availability") {
      const { apartment_id, check_in, check_out, room_id } = payload;

      if (!isString(apartment_id, 50) || !isISODate(check_in) || !isISODate(check_out)) {
        return new Response(JSON.stringify({ available: false, error: "Ungültige Eingabe" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (room_id) {
        if (!isUUID(room_id)) {
          return new Response(JSON.stringify({ available: false, error: "Ungültige room_id" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const hasOverlap = await checkDbOverlap(room_id, check_in, check_out);
        if (hasOverlap) {
          return new Response(JSON.stringify({ available: false, error: "Bereits gebucht in diesem Zeitraum" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const res = await fetch(
        `${SMOOBU_API_BASE}/apartments/${encodeURIComponent(apartment_id)}/rates?start_date=${check_in}&end_date=${check_out}`,
        { headers: { "Api-Key": smoobuApiKey, "Content-Type": "application/json" } }
      );

      if (!res.ok) {
        return new Response(JSON.stringify({ available: false, error: "Smoobu nicht erreichbar" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await res.json();
      const allAvailable = Object.values(data.data || {}).every((day: any) => day.available === 1);
      return new Response(JSON.stringify({ available: allAvailable, rates: data.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Create booking ──
    if (action === "create-booking" || action === "create-booking-sandbox") {
      const {
        apartment_id, check_in, check_out, guest_name, guest_email,
        guest_phone, guests_count, room_id, notes, total_price, user_id,
      } = payload;

      // Input validation (server-side)
      if (
        !isString(apartment_id, 50) ||
        !isISODate(check_in) ||
        !isISODate(check_out) ||
        !isString(guest_name, 200) ||
        !isEmail(guest_email) ||
        !isUUID(room_id) ||
        check_in >= check_out
      ) {
        return new Response(
          JSON.stringify({ success: false, error: "Ungültige Eingabedaten" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const guestsNum = Number(guests_count ?? 1);
      if (!Number.isInteger(guestsNum) || guestsNum < 1 || guestsNum > 10) {
        return new Response(
          JSON.stringify({ success: false, error: "Ungültige Gästezahl" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (guest_phone !== undefined && guest_phone !== null && !isString(guest_phone, 50)) {
        return new Response(
          JSON.stringify({ success: false, error: "Ungültige Telefonnummer" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (notes !== undefined && notes !== null && typeof notes === "string" && notes.length > 2000) {
        return new Response(
          JSON.stringify({ success: false, error: "Notizen zu lang" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sandbox mode: admin-only
      if (action === "create-booking-sandbox") {
        const callerId = await getCallerUserId();
        if (!callerId || !(await isAdmin(callerId))) {
          return new Response(
            JSON.stringify({ success: false, error: "Nur Administratoren dürfen Sandbox-Buchungen anlegen." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Rate limit (per email + IP) for non-sandbox
      if (action === "create-booking") {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
        const rateKey = `${guest_email.toLowerCase()}|${ip}`;
        if (!checkRateLimit(rateKey)) {
          return new Response(
            JSON.stringify({ success: false, error: "Zu viele Buchungsversuche. Bitte später erneut versuchen." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Verify room exists and is active (defense-in-depth alongside RLS)
      const { data: roomRow } = await supabase
        .from("rooms")
        .select("id,is_active")
        .eq("id", room_id)
        .maybeSingle();
      if (!roomRow || !roomRow.is_active) {
        return new Response(
          JSON.stringify({ success: false, error: "Apartment ist nicht verfügbar." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 1. DB-level double-booking check
      const hasOverlap = await checkDbOverlap(room_id, check_in, check_out);
      if (hasOverlap) {
        return new Response(
          JSON.stringify({ success: false, error: "Dieses Apartment ist für den gewählten Zeitraum bereits gebucht." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === "create-booking-sandbox") {
        const { data: booking, error: sandboxError } = await supabase.from("bookings").insert({
          room_id,
          guest_name,
          guest_email,
          guest_phone: guest_phone || null,
          check_in,
          check_out,
          guests_count: guestsNum,
          notes: notes || "[SANDBOX] Testbuchung",
          status: "confirmed",
          total_price: total_price ?? null,
          user_id: user_id || null,
          smoobu_reservation_id: `sandbox_${crypto.randomUUID().slice(0, 8)}`,
          qr_code_data: JSON.stringify({
            booking_id: "sandbox",
            guest_name,
            check_in,
            check_out,
            room_id,
            sandbox: true,
          }),
        }).select().single();

        if (sandboxError) {
          console.error("Sandbox insert error:", sandboxError);
          return new Response(JSON.stringify({ success: false, error: "Buchung konnte nicht erstellt werden." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ success: true, sandbox: true, booking, smoobu_synced: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 2. Live Smoobu availability check
      const availRes = await fetch(
        `${SMOOBU_API_BASE}/apartments/${encodeURIComponent(apartment_id)}/rates?start_date=${check_in}&end_date=${check_out}`,
        { headers: { "Api-Key": smoobuApiKey, "Content-Type": "application/json" } }
      );

      if (availRes.ok) {
        const availData = await availRes.json();
        const allAvailable = Object.values(availData.data || {}).every((day: any) => day.available === 1);
        if (!allAvailable) {
          return new Response(
            JSON.stringify({ success: false, error: "Zimmer ist für diesen Zeitraum nicht verfügbar (Smoobu)" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // 3. Create reservation in Smoobu
      const [firstName, ...lastParts] = guest_name.split(" ");
      const lastName = lastParts.join(" ") || firstName;

      const smoobuRes = await fetch(`${SMOOBU_API_BASE}/reservations`, {
        method: "POST",
        headers: { "Api-Key": smoobuApiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          apartmentId: apartment_id,
          arrivalDate: check_in,
          departureDate: check_out,
          firstName,
          lastName,
          email: guest_email,
          phone: guest_phone || "",
          adults: guestsNum,
          note: notes || "",
          channelId: 0,
        }),
      });

      let smoobuReservationId: string | null = null;
      if (smoobuRes.ok) {
        const smoobuData = await smoobuRes.json();
        smoobuReservationId = String(smoobuData.id || smoobuData.reservationId || "");
      }

      // 4. Create booking in database
      const { data: booking, error: dbError } = await supabase.from("bookings").insert({
        room_id,
        guest_name,
        guest_email,
        guest_phone: guest_phone || null,
        check_in,
        check_out,
        guests_count: guestsNum,
        notes: notes || null,
        status: smoobuReservationId ? "confirmed" : "pending",
        total_price: total_price ?? null,
        user_id: user_id || null,
        smoobu_reservation_id: smoobuReservationId,
        qr_code_data: JSON.stringify({
          booking_id: "pending",
          guest_name,
          check_in,
          check_out,
          room_id,
          payment_method: "vor_ort",
        }),
      }).select().single();

      if (dbError) {
        console.error("Booking insert error:", dbError);
        return new Response(JSON.stringify({ success: false, error: "Buchung konnte nicht gespeichert werden." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update QR code with real booking ID
      await supabase.from("bookings").update({
        qr_code_data: JSON.stringify({
          booking_id: booking.id,
          guest_name,
          check_in,
          check_out,
          room_id,
          smoobu_id: smoobuReservationId,
          payment_method: "vor_ort",
        }),
      }).eq("id", booking.id);

      return new Response(
        JSON.stringify({ success: true, booking, smoobu_synced: !!smoobuReservationId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("smoobu-sync error:", err);
    return new Response(JSON.stringify({ error: "Interner Serverfehler" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
