import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const payload = await req.json();
    const action = payload.action; // "newReservation", "cancelReservation", "updateReservation"
    const reservation = payload.data || payload;

    const smoobuId = String(reservation.id || reservation.reservationId || "");
    if (!smoobuId) {
      return new Response(JSON.stringify({ error: "No reservation ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cancelReservation" || action === "deleteReservation") {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("smoobu_reservation_id", smoobuId);

      return new Response(JSON.stringify({ success: true, action: "cancelled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "updateReservation" || action === "newReservation") {
      // Check if booking exists
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("smoobu_reservation_id", smoobuId)
        .maybeSingle();

      if (existing) {
        await supabase.from("bookings").update({
          check_in: reservation.arrival || reservation.arrivalDate,
          check_out: reservation.departure || reservation.departureDate,
          guest_name: `${reservation.firstName || ""} ${reservation.lastName || ""}`.trim(),
          guest_email: reservation.email || "webhook@smoobu.com",
          status: "confirmed",
        }).eq("id", existing.id);
      }
      // For new external bookings (from Booking.com/Airbnb), we could create them too
      // but they don't have a room_id mapping yet — left for future mapping config

      return new Response(JSON.stringify({ success: true, action: "updated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
