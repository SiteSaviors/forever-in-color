import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GetPremiumPreviewRequest {
  storagePath: string;
  expiresInSeconds?: number;
}

/**
 * Generate time-limited signed URLs for premium (watermark-free) preview downloads
 * Only available to authenticated users with paid subscriptions (creator/plus/pro tiers)
 */
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: GetPremiumPreviewRequest = await req.json();
    const { storagePath, expiresInSeconds = 86400 } = body; // Default: 24 hours

    // Validate required fields
    if (!storagePath) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: storagePath' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth token from headers
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || token === SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user entitlements
    const { data: entitlement } = await supabase
      .from('v_entitlements')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle();

    const tier = entitlement?.tier ?? 'free';

    // Only creator/plus/pro tiers can access premium (clean) previews
    if (!['creator', 'plus', 'pro'].includes(tier)) {
      return new Response(
        JSON.stringify({
          error: 'Premium preview access requires Creator, Plus, or Pro subscription',
          tier,
          requiresUpgrade: true
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signed URL from premium bucket
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('preview-cache-premium')
      .createSignedUrl(storagePath, expiresInSeconds);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('[get-premium-preview] Failed to create signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate download URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return signed URL with expiry
    return new Response(
      JSON.stringify({
        signedUrl: signedUrlData.signedUrl,
        expiresAt: Date.now() + (expiresInSeconds * 1000),
        tier
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-premium-preview] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
