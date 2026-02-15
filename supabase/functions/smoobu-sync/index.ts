import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMOOBU_API_BASE = "https://login.smoobu.com/api";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const smoobuApiKey = Deno.env.get("SMOOBU_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { action, ...payload } = await req.json();

    // Check availability
    if (action === "check-availability") {
      const { apartment_id, check_in, check_out } = payload;

      const res = await fetch(
        `${SMOOBU_API_BASE}/apartments/${apartment_id}/rates?start_date=${check_in}&end_date=${check_out}`,
        { headers: { "Api-Key": smoobuApiKey, "Content-Type": "application/json" } }
      );

      if (!res.ok) {
        const errText = await res.text();
        return new Response(JSON.stringify({ available: false, error: errText }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await res.json();
      // Check if all days are available
      const allAvailable = Object.values(data.data || {}).every((day: any) => day.available === 1);
      return new Response(JSON.stringify({ available: allAvailable, rates: data.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create booking
    if (action === "create-booking") {
      const { apartment_id, check_in, check_out, guest_name, guest_email, guest_phone, guests_count, room_id, notes } = payload;

      // 1. Live availability check
      const availRes = await fetch(
        `${SMOOBU_API_BASE}/apartments/${apartment_id}/rates?start_date=${check_in}&end_date=${check_out}`,
        { headers: { "Api-Key": smoobuApiKey, "Content-Type": "application/json" } }
      );

      if (availRes.ok) {
        const availData = await availRes.json();
        const allAvailable = Object.values(availData.data || {}).every((day: any) => day.available === 1);
        if (!allAvailable) {
          return new Response(
            JSON.stringify({ success: false, error: "Zimmer ist für diesen Zeitraum nicht verfügbar" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // 2. Create reservation in Smoobu
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
          adults: guests_count,
          note: notes || "",
          channelId: 0, // Direct booking
        }),
      });

      let smoobuReservationId: string | null = null;
      if (smoobuRes.ok) {
        const smoobuData = await smoobuRes.json();
        smoobuReservationId = String(smoobuData.id || smoobuData.reservationId || "");
      }

      // 3. Create booking in database
      const { data: booking, error: dbError } = await supabase.from("bookings").insert({
        room_id,
        guest_name,
        guest_email,
        guest_phone: guest_phone || null,
        check_in,
        check_out,
        guests_count: guests_count || 1,
        notes: notes || null,
        status: smoobuReservationId ? "confirmed" : "pending",
        smoobu_reservation_id: smoobuReservationId,
        qr_code_data: JSON.stringify({
          booking_id: "pending",
          guest_name,
          check_in,
          check_out,
          room_id,
        }),
      }).select().single();

      if (dbError) {
        return new Response(JSON.stringify({ success: false, error: dbError.message }), {
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
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
