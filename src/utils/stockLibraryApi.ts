/**
 * Stock Library API Client
 *
 * Type-safe wrapper for the get-stock-library edge function.
 * Handles request construction, response parsing, and error normalization.
 */

/**
 * Stock category enum
 */
export type StockCategory =
  | 'all'
  | 'nature-outdoors'
  | 'animals-wildlife'
  | 'people-portraits'
  | 'food-culture'
  | 'abstract-texture'
  | 'scifi-fantasy'
  | 'classic-vintage';

/**
 * Stock image (matches edge function response)
 */
export interface StockImage {
  id: string;
  category: StockCategory;
  title: string;
  tags: string[];
  thumbnailUrl: string;
  fullUrl: string;
  aspectRatio: number;
  orientation: 'horizontal' | 'vertical' | 'square';
  toneHints: string[];
  colorPalette: string[];
  curatedRank: number;
  requiredTier?: 'free' | 'creator' | 'plus' | 'pro' | null;
}

/**
 * Fetch stock images request parameters
 */
export interface FetchStockImagesParams {
  category?: StockCategory;
  search?: string;
  sort?: 'recommended' | 'popular';
  limit?: number;
  cursor?: string | null;
}

/**
 * Fetch stock images response
 */
export interface StockImageListResponse {
  images: StockImage[];
  nextCursor: string | null;
  total: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/**
 * Fetch stock images from the library
 *
 * @param params - Query parameters for filtering, searching, sorting, and pagination
 * @returns Promise resolving to stock image list or error object
 *
 * @example
 * ```typescript
 * // Fetch first page of all images
 * const result = await fetchStockImages({ category: 'all', limit: 24 });
 *
 * // Fetch next page
 * if (!('error' in result) && result.nextCursor) {
 *   const nextPage = await fetchStockImages({
 *     category: 'all',
 *     limit: 24,
 *     cursor: result.nextCursor,
 *   });
 * }
 *
 * // Search for specific images
 * const searchResult = await fetchStockImages({
 *   category: 'nature-outdoors',
 *   search: 'mountain',
 *   sort: 'recommended',
 * });
 * ```
 */
export async function fetchStockImages(
  params: FetchStockImagesParams = {}
): Promise<StockImageListResponse | { error: string }> {
  try {
    const queryParams = new URLSearchParams();

    // Add category filter (optional)
    if (params.category && params.category !== 'all') {
      queryParams.append('category', params.category);
    } else if (params.category === 'all') {
      queryParams.append('category', 'all');
    }

    // Add search query (optional)
    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim());
    }

    // Add sort mode (optional)
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }

    // Add limit (optional, default handled by edge function)
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    // Add cursor for pagination (optional)
    if (params.cursor) {
      queryParams.append('cursor', params.cursor);
    }

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    };

    // No authentication required for stock library (public read access)
    // But we still send the anon key for rate limiting

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-stock-library?${queryParams.toString()}`,
      {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

      // User-friendly error messages based on status code
      if (response.status >= 500) {
        return { error: 'Our servers are temporarily unavailable. Please try again in a moment.' };
      }
      if (response.status === 404) {
        return { error: 'Stock library not found. Please contact support.' };
      }
      if (response.status === 400) {
        return { error: errorData.error || 'Invalid request parameters.' };
      }

      return { error: errorData.error || `Failed to fetch stock images (${response.status})` };
    }

    const data: StockImageListResponse = await response.json();

    // Validate response structure
    if (!data || !Array.isArray(data.images)) {
      return { error: 'Invalid response format from server.' };
    }

    return data;
  } catch (error) {
    console.error('[stockLibraryApi] fetchStockImages error:', error);

    // Network error (offline, timeout, CORS, etc.)
    if (error instanceof TypeError) {
      return { error: 'Network error. Please check your connection and try again.' };
    }

    // Timeout error
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { error: 'Request timed out. Please try again.' };
    }

    // Generic error
    return { error: error instanceof Error ? error.message : 'Unknown error occurred.' };
  }
}

/**
 * Validate a stock category string
 */
export function isValidStockCategory(category: string): category is StockCategory {
  const validCategories: StockCategory[] = [
    'all',
    'nature-outdoors',
    'animals-wildlife',
    'people-portraits',
    'food-culture',
    'abstract-texture',
    'scifi-fantasy',
    'classic-vintage',
  ];
  return validCategories.includes(category as StockCategory);
}

/**
 * Get display name for a stock category
 */
export function getStockCategoryName(category: StockCategory): string {
  const names: Record<StockCategory, string> = {
    'all': 'Browse All',
    'nature-outdoors': 'Nature & Outdoors',
    'animals-wildlife': 'Animals & Wildlife',
    'people-portraits': 'People & Portraits',
    'food-culture': 'Food & Culture',
    'abstract-texture': 'Abstract & Texture',
    'scifi-fantasy': 'Sci-Fi & Fantasy',
    'classic-vintage': 'Classic & Vintage',
  };
  return names[category] || category;
}

/**
 * Get description for a stock category
 */
export function getStockCategoryDescription(category: StockCategory): string {
  const descriptions: Record<StockCategory, string> = {
    'all': 'Explore our entire collection of curated stock images',
    'nature-outdoors': 'Mountains, forests, oceans, and natural vistas',
    'animals-wildlife': 'Pets, wildlife, and animal portraits',
    'people-portraits': 'Human portraits and lifestyle photography',
    'food-culture': 'Culinary scenes and cultural moments',
    'abstract-texture': 'Patterns, textures, and abstract compositions',
    'scifi-fantasy': 'Futuristic and fantastical imagery',
    'classic-vintage': 'Timeless and nostalgic photography',
  };
  return descriptions[category] || '';
}
