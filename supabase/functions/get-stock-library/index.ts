/**
 * get-stock-library Edge Function
 *
 * Fetches curated stock images with cursor-based pagination.
 * No authentication required - public read access.
 *
 * Query Parameters:
 * - category: 'all' | StockCategory (optional, defaults to 'all')
 * - search: string (optional, searches title and tags)
 * - sort: 'recommended' | 'popular' (optional, defaults to 'recommended')
 * - limit: number (optional, defaults to 24, max 50)
 * - cursor: string (optional, base64 encoded cursor for pagination)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ALLOWED_ORIGINS = Deno.env.get('WT_PREVIEW_ALLOWED_ORIGINS') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

/**
 * Clamp a value to a positive integer with fallback
 */
function clampPositiveInt(value: string | number | null | undefined, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

/**
 * Encode cursor for pagination (base64)
 */
function encodeCursor(rank: number, id: string): string {
  return btoa(JSON.stringify({ rank, id }));
}

/**
 * Decode cursor from base64
 */
function decodeCursor(cursor: string): { rank: number; id: string } | null {
  try {
    const decoded = JSON.parse(atob(cursor));
    if (typeof decoded.rank === 'number' && typeof decoded.id === 'string') {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Stock image type (matches database schema)
 */
interface StockImageRow {
  id: string;
  category: string;
  title: string;
  tags: string[];
  thumbnail_url: string;
  full_url: string;
  aspect_ratio: number;
  orientation: string;
  tone_hints: string[];
  color_palette: string[];
  curated_rank: number;
  created_at: string;
  updated_at: string;
  required_tier: string | null;
}

/**
 * Transform snake_case DB row to camelCase API response
 */
interface StockImageResponse {
  id: string;
  category: string;
  title: string;
  tags: string[];
  thumbnailUrl: string;
  fullUrl: string;
  aspectRatio: number;
  orientation: string;
  toneHints: string[];
  colorPalette: string[];
  curatedRank: number;
  requiredTier: string | null;
}

function transformStockImage(row: StockImageRow): StockImageResponse {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    tags: row.tags,
    thumbnailUrl: row.thumbnail_url,
    fullUrl: row.full_url,
    aspectRatio: row.aspect_ratio,
    orientation: row.orientation,
    toneHints: row.tone_hints,
    colorPalette: row.color_palette,
    curatedRank: row.curated_rank,
    requiredTier: row.required_tier,
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);

    // Parse query parameters
    const categoryParam = url.searchParams.get('category') || 'all';
    const searchQuery = url.searchParams.get('search') || '';
    const sortMode = url.searchParams.get('sort') || 'recommended';
    const limitParam = clampPositiveInt(url.searchParams.get('limit'), 24);
    const cursorParam = url.searchParams.get('cursor');

    // Validate and clamp limit (max 50)
    const limit = Math.min(limitParam, 50);

    // Validate category
    const validCategories = [
      'all',
      'nature-outdoors',
      'animals-wildlife',
      'people-portraits',
      'food-culture',
      'abstract-texture',
      'scifi-fantasy',
      'classic-vintage',
    ];

    if (!validCategories.includes(categoryParam)) {
      return new Response(
        JSON.stringify({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate sort mode
    if (sortMode !== 'recommended' && sortMode !== 'popular') {
      return new Response(
        JSON.stringify({ error: 'Invalid sort mode. Must be "recommended" or "popular"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode cursor if provided
    let cursorRank = 0;
    let cursorId = '';
    if (cursorParam) {
      const cursor = decodeCursor(cursorParam);
      if (!cursor) {
        return new Response(
          JSON.stringify({ error: 'Invalid cursor format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      cursorRank = cursor.rank;
      cursorId = cursor.id;
    }

    // Create Supabase client (service role for public read access)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Build query
    let query = supabase
      .from('stock_images')
      .select('*', { count: 'exact' });

    // Filter by category (unless 'all')
    if (categoryParam !== 'all') {
      query = query.eq('category', categoryParam);
    }

    // Filter by search query (title or tags)
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.trim();
      query = query.or(`title.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
    }

    // Apply sorting
    if (sortMode === 'recommended') {
      // Sort by curated_rank (lower rank = higher priority)
      query = query.order('curated_rank', { ascending: true });
      query = query.order('id', { ascending: true }); // Tie-breaker for stable sorting
    } else {
      // popular: sort by curated_rank descending (placeholder - can be replaced with view count later)
      query = query.order('curated_rank', { ascending: false });
      query = query.order('id', { ascending: true });
    }

    // Apply cursor-based pagination
    if (cursorParam && cursorRank !== undefined) {
      if (sortMode === 'recommended') {
        query = query.or(`curated_rank.gt.${cursorRank},and(curated_rank.eq.${cursorRank},id.gt.${cursorId})`);
      } else {
        query = query.or(`curated_rank.lt.${cursorRank},and(curated_rank.eq.${cursorRank},id.gt.${cursorId})`);
      }
    }

    // Limit results
    query = query.limit(limit + 1); // Fetch one extra to determine if there's a next page

    // Execute query
    const { data: rows, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('[get-stock-library] Database error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stock images', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!rows) {
      return new Response(
        JSON.stringify({ error: 'No data returned from database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if there's a next page
    const hasNextPage = rows.length > limit;
    const images = hasNextPage ? rows.slice(0, limit) : rows;

    // Generate next cursor
    let nextCursor: string | null = null;
    if (hasNextPage && images.length > 0) {
      const lastImage = images[images.length - 1];
      nextCursor = encodeCursor(lastImage.curated_rank, lastImage.id);
    }

    // Transform to camelCase
    const transformedImages = images.map((row) => transformStockImage(row as StockImageRow));

    // Return response
    const response = {
      images: transformedImages,
      nextCursor,
      total: count ?? 0,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-stock-library] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
