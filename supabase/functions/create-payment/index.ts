import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id, room_title, total_price, nights, guest_email } = await req.json();

    if (!booking_id || !total_price || !room_title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://studiobremen.lovable.app";

    // Create a one-time checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer_email: guest_email || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: room_title,
              description: `${nights} ${nights === 1 ? "Nacht" : "Nächte"}`,
            },
            unit_amount: Math.round(total_price * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/buchung-bestaetigt?booking_id=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/zimmer`,
      metadata: {
        booking_id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
