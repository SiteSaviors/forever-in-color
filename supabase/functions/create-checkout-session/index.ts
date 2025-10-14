import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const priceMapRaw = Deno.env.get('STRIPE_PRICE_MAP_JSON');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeSecret) {
  console.error('[stripe-checkout] STRIPE_SECRET_KEY is not set');
}

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;
const priceMap: Record<string, string> = (() => {
  try {
    return priceMapRaw ? JSON.parse(priceMapRaw) : {};
  } catch (error) {
    console.error('[stripe-checkout] Failed to parse STRIPE_PRICE_MAP_JSON', error);
    return {};
  }
})();

const buildCorsHeaders = (origin?: string | null) => ({
  'Access-Control-Allow-Origin': origin ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
});

serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'method_not_allowed' }),
      { status: 405, headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }

  if (!stripe || !supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'configuration_error' }),
      { status: 500, headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const { tier, successUrl, cancelUrl } = await req.json();

    if (!tier || typeof tier !== 'string') {
      return new Response(JSON.stringify({ error: 'invalid_tier' }), {
        status: 400,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const tierKey = tier.toLowerCase();
    const priceInfo = priceMap[tierKey];

    if (!priceInfo) {
      return new Response(JSON.stringify({ error: 'unsupported_tier' }), {
        status: 400,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const priceId = typeof priceInfo === 'string' ? priceInfo : priceInfo.monthly;

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'price_not_configured' }), {
        status: 400,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin') ?? ''}/pricing?checkout=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin') ?? ''}/pricing?checkout=cancelled`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userData.user.email ?? undefined,
      metadata: {
        user_id: userData.user.id,
        tier: tierKey,
      },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[stripe-checkout] Failed to create checkout session', error);
    return new Response(JSON.stringify({ error: 'checkout_failed' }), {
      status: 500,
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }
});
