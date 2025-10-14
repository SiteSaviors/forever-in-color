import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GalleryItem {
  id: string;
  userId: string | null;
  anonToken: string | null;
  previewLogId: string | null;
  styleId: string;
  styleName: string;
  orientation: string;
  watermarkedUrl: string;
  cleanUrl: string | null;
  isFavorited: boolean;
  isDeleted: boolean;
  downloadCount: number;
  lastDownloadedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wt-anon',
  'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    // Get auth token from headers
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const anonToken = req.headers.get('X-WT-Anon');

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Determine user identity
    let userId: string | null = null;
    let effectiveAnonToken: string | null = null;

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
      // Anonymous user
      effectiveAnonToken = anonToken || null;
      if (!effectiveAnonToken) {
        return new Response(
          JSON.stringify({ error: 'Anonymous token required for unauthenticated requests' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let requiresWatermark = true;
    if (userId) {
      const { data: entitlementRow } = await supabase
        .from('v_entitlements')
        .select('tier, dev_override')
        .eq('user_id', userId)
        .maybeSingle();

      const tier = (entitlementRow?.tier ?? 'free').toString().toLowerCase();
      const devOverride = Boolean(entitlementRow?.dev_override);
      requiresWatermark = !(devOverride || tier === 'creator' || tier === 'plus' || tier === 'pro');
    }

    // GET: Fetch gallery items
    if (req.method === 'GET') {
      // Parse query parameters
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const styleFilter = url.searchParams.get('style') || null;
      const orientationFilter = url.searchParams.get('orientation') || null;
      const favoritesOnly = url.searchParams.get('favorites') === 'true';
      const sortBy = url.searchParams.get('sort') || 'newest'; // newest, oldest, downloads

      // Build query
      let query = supabase
        .from('user_gallery')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .eq(userId ? 'user_id' : 'anon_token', userId || effectiveAnonToken);

      if (styleFilter) {
        query = query.eq('style_id', styleFilter);
      }

      if (orientationFilter && ['horizontal', 'vertical', 'square'].includes(orientationFilter)) {
        query = query.eq('orientation', orientationFilter);
      }

      if (favoritesOnly) {
        query = query.eq('is_favorited', true);
      }

      // Apply sorting
      if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'downloads') {
        query = query.order('download_count', { ascending: false });
      } else {
        // Default: newest first
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: items, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('[get-gallery] Fetch error:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch gallery items' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Transform to camelCase
      const galleryItems: GalleryItem[] = (items || []).map((item: Record<string, unknown>) => ({
        id: item.id,
        userId: item.user_id,
        anonToken: item.anon_token,
        previewLogId: item.preview_log_id,
        styleId: item.style_id,
        styleName: item.style_name,
        orientation: item.orientation,
        watermarkedUrl: item.watermarked_url,
        cleanUrl: item.clean_url,
        isFavorited: item.is_favorited,
        isDeleted: item.is_deleted,
        downloadCount: item.download_count,
        lastDownloadedAt: item.last_downloaded_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      const responsePayload = {
        items: galleryItems.map((item) => ({
          ...item,
          cleanUrl: requiresWatermark ? null : item.cleanUrl
        })),
        total: count || 0,
        limit,
        offset,
      };

      return new Response(
        JSON.stringify({
          ...responsePayload,
          requiresWatermark
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE: Delete a gallery item (soft delete)
    if (req.method === 'DELETE') {
      const itemId = url.searchParams.get('id');
      if (!itemId) {
        return new Response(
          JSON.stringify({ error: 'Missing gallery item ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify ownership and soft delete
      const { error: deleteError } = await supabase
        .from('user_gallery')
        .update({ is_deleted: true })
        .eq('id', itemId)
        .eq(userId ? 'user_id' : 'anon_token', userId || effectiveAnonToken);

      if (deleteError) {
        console.error('[get-gallery] Delete error:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete gallery item' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Gallery item deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PATCH: Update gallery item (favorite toggle, download tracking)
    if (req.method === 'PATCH') {
      const itemId = url.searchParams.get('id');
      if (!itemId) {
        return new Response(
          JSON.stringify({ error: 'Missing gallery item ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const updates: Record<string, unknown> = {};

      if (typeof body.isFavorited === 'boolean') {
        updates.is_favorited = body.isFavorited;
      }

      if (body.incrementDownload === true) {
        // Fetch current download count and increment
        const { data: current } = await supabase
          .from('user_gallery')
          .select('download_count')
          .eq('id', itemId)
          .eq(userId ? 'user_id' : 'anon_token', userId || effectiveAnonToken)
          .single();

        if (current) {
          updates.download_count = ((current as Record<string, number>).download_count || 0) + 1;
          updates.last_downloaded_at = new Date().toISOString();
        }
      }

      if (Object.keys(updates).length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid updates provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Apply update
      const { data: updated, error: updateError } = await supabase
        .from('user_gallery')
        .update(updates)
        .eq('id', itemId)
        .eq(userId ? 'user_id' : 'anon_token', userId || effectiveAnonToken)
        .select()
        .single();

      if (updateError) {
        console.error('[get-gallery] Update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update gallery item' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          message: 'Gallery item updated successfully',
          item: {
            id: updated.id,
            isFavorited: updated.is_favorited,
            downloadCount: updated.download_count,
            lastDownloadedAt: updated.last_downloaded_at,
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-gallery] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
