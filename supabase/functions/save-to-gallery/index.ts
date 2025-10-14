import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SaveToGalleryRequest {
  previewLogId?: string;
  styleId: string;
  styleName: string;
  orientation: 'horizontal' | 'vertical' | 'square';
  watermarkedUrl: string;
  cleanUrl?: string;
  anonToken?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wt-anon',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: SaveToGalleryRequest = await req.json();
    const { previewLogId, styleId, styleName, orientation, watermarkedUrl, cleanUrl } = body;

    // Validate required fields
    if (!styleId || !styleName || !orientation || !watermarkedUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: styleId, styleName, orientation, watermarkedUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate orientation
    if (!['horizontal', 'vertical', 'square'].includes(orientation)) {
      return new Response(
        JSON.stringify({ error: 'Invalid orientation. Must be: horizontal, vertical, or square' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth token from headers
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Determine user identity
    let userId: string | null = null;

    if (token && token !== SUPABASE_SERVICE_ROLE_KEY) {
      // Authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = user.id;
    } else {
      return new Response(
        JSON.stringify({ error: 'Authentication required to save to gallery' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this preview is already saved
    const { data: existing, error: checkError } = await supabase
      .from('user_gallery')
      .select('id')
      .eq('is_deleted', false)
      .eq('user_id', userId)
      .eq('style_id', styleId)
      .eq('orientation', orientation)
      .eq('watermarked_url', watermarkedUrl)
      .maybeSingle();

    if (checkError) {
      console.error('[save-to-gallery] Error checking existing:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing gallery item' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existing) {
      return new Response(
        JSON.stringify({
          message: 'Preview already saved to gallery',
          galleryItemId: existing.id,
          alreadyExists: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert into gallery
    const { data: galleryItem, error: insertError } = await supabase
      .from('user_gallery')
      .insert({
        user_id: userId,
        anon_token: null,
        preview_log_id: previewLogId || null,
        style_id: styleId,
        style_name: styleName,
        orientation,
        watermarked_url: watermarkedUrl,
        clean_url: cleanUrl || null,
        is_favorited: false,
        is_deleted: false,
        download_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[save-to-gallery] Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save to gallery', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({
        message: 'Successfully saved to gallery',
        galleryItemId: galleryItem.id,
        galleryItem: {
          id: galleryItem.id,
          styleId: galleryItem.style_id,
          styleName: galleryItem.style_name,
          orientation: galleryItem.orientation,
          watermarkedUrl: galleryItem.watermarked_url,
          cleanUrl: galleryItem.clean_url,
          createdAt: galleryItem.created_at,
        },
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[save-to-gallery] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
