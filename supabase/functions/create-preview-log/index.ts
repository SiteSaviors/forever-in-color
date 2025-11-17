import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase env vars for create-preview-log');
}

type CreatePreviewLogRequest = {
  storagePath: string;
  orientation: 'horizontal' | 'vertical' | 'square';
  styleId?: string;
  displayUrl?: string | null;
  cropConfig?: Record<string, unknown> | null;
  idempotencyKey?: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token || token === SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: CreatePreviewLogRequest = await req.json();
    const { storagePath, orientation, styleId = 'original-image', displayUrl = null, cropConfig = null, idempotencyKey } = body;

    if (!storagePath || typeof storagePath !== 'string') {
      return new Response(JSON.stringify({ error: 'storagePath is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['horizontal', 'vertical', 'square'].includes(orientation)) {
      return new Response(JSON.stringify({ error: 'orientation must be horizontal, vertical, or square' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const insertPayload = {
      idempotency_key: idempotencyKey ?? crypto.randomUUID(),
      user_id: user.id,
      style_id: styleId,
      orientation,
      preview_url: displayUrl,
      source_storage_path: storagePath,
      source_display_url: displayUrl,
      crop_config: cropConfig,
      outcome: 'pending',
      priority: 'standard',
      requires_watermark: false,
      watermark: false,
    };

    const { data, error } = await supabase
      .from('preview_logs')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error || !data) {
      console.error('[create-preview-log] Insert failed', error);
      return new Response(JSON.stringify({ error: 'Failed to create preview log' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ previewLogId: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[create-preview-log] Unexpected error', error);
    return new Response(JSON.stringify({ error: 'Unexpected error creating preview log' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
