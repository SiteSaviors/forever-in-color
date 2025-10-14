export interface GalleryItem {
  id: string;
  userId: string | null;
  anonToken: string | null;
  previewLogId: string | null;
  styleId: string;
  styleName: string;
  orientation: 'horizontal' | 'vertical' | 'square';
  watermarkedUrl: string;
  cleanUrl: string | null;
  isFavorited: boolean;
  isDeleted: boolean;
  downloadCount: number;
  lastDownloadedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryListResponse {
  items: GalleryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface SaveToGalleryParams {
  previewLogId?: string;
  styleId: string;
  styleName: string;
  orientation: 'horizontal' | 'vertical' | 'square';
  watermarkedUrl: string;
  cleanUrl?: string;
  anonToken?: string | null;
  accessToken?: string | null;
}

export interface GalleryFilters {
  style?: string;
  orientation?: 'horizontal' | 'vertical' | 'square';
  favorites?: boolean;
  sort?: 'newest' | 'oldest' | 'downloads';
  limit?: number;
  offset?: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/**
 * Save a preview to the user's gallery
 */
export async function saveToGallery(params: SaveToGalleryParams): Promise<{
  success: boolean;
  galleryItemId?: string;
  alreadyExists?: boolean;
  error?: string;
}> {
  try {
    const { anonToken, accessToken, ...body } = params;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    };

    // Add auth token
    const token = accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add anon token if present
    if (anonToken) {
      headers['X-WT-Anon'] = anonToken;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/save-to-gallery`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: errorData.error || `Failed to save (${response.status})`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      galleryItemId: data.galleryItemId,
      alreadyExists: data.alreadyExists || false,
    };
  } catch (error) {
    console.error('[galleryApi] saveToGallery error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch gallery items with filters and pagination
 */
export async function fetchGalleryItems(
  filters: GalleryFilters = {},
  anonToken?: string | null,
  accessToken?: string | null
): Promise<GalleryListResponse | { error: string }> {
  try {
    const params = new URLSearchParams();
    if (filters.style) params.append('style', filters.style);
    if (filters.orientation) params.append('orientation', filters.orientation);
    if (filters.favorites) params.append('favorites', 'true');
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    };

    // Add auth token
    const token = accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add anon token if present
    if (anonToken) {
      headers['X-WT-Anon'] = anonToken;
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-gallery?${params.toString()}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { error: errorData.error || `Failed to fetch gallery (${response.status})` };
    }

    const data: GalleryListResponse = await response.json();
    return data;
  } catch (error) {
    console.error('[galleryApi] fetchGalleryItems error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete a gallery item (soft delete)
 */
export async function deleteGalleryItem(
  itemId: string,
  anonToken?: string | null,
  accessToken?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    };

    const token = accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (anonToken) {
      headers['X-WT-Anon'] = anonToken;
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-gallery?id=${encodeURIComponent(itemId)}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { success: false, error: errorData.error || `Failed to delete (${response.status})` };
    }

    return { success: true };
  } catch (error) {
    console.error('[galleryApi] deleteGalleryItem error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Toggle favorite status of a gallery item
 */
export async function toggleGalleryFavorite(
  itemId: string,
  isFavorited: boolean,
  anonToken?: string | null,
  accessToken?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    };

    const token = accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (anonToken) {
      headers['X-WT-Anon'] = anonToken;
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-gallery?id=${encodeURIComponent(itemId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isFavorited }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { success: false, error: errorData.error || `Failed to toggle favorite (${response.status})` };
    }

    return { success: true };
  } catch (error) {
    console.error('[galleryApi] toggleGalleryFavorite error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Increment download count for a gallery item
 */
export async function incrementGalleryDownload(
  itemId: string,
  anonToken?: string | null,
  accessToken?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    };

    const token = accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (anonToken) {
      headers['X-WT-Anon'] = anonToken;
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-gallery?id=${encodeURIComponent(itemId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ incrementDownload: true }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { success: false, error: errorData.error || `Failed to increment download (${response.status})` };
    }

    return { success: true };
  } catch (error) {
    console.error('[galleryApi] incrementGalleryDownload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get download URL for a gallery item based on user's tier
 * Returns clean URL if user has access, otherwise watermarked URL
 */
export function getGalleryDownloadUrl(item: GalleryItem, hasCleanAccess: boolean): string {
  return hasCleanAccess && item.cleanUrl ? item.cleanUrl : item.watermarkedUrl;
}
