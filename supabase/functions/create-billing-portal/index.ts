import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const buildCorsHeaders = (origin?: string | null) => ({
  'Access-Control-Allow-Origin': origin ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
});

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }

  if (!stripe || !supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'configuration_error' }), {
      status: 500,
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const customerId = profile?.stripe_customer_id;
    if (!customerId) {
      return new Response(JSON.stringify({ error: 'customer_not_found' }), {
        status: 400,
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    let body: { returnUrl?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const resolvedReturnUrl = typeof body.returnUrl === 'string' && body.returnUrl.trim().length > 0
      ? body.returnUrl
      : `${origin ?? ''}/pricing?portal=return`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: resolvedReturnUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[billing-portal] Failed to create session', error);
    return new Response(JSON.stringify({ error: 'billing_portal_failed' }), {
      status: 500,
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});
