const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.warn('[StylePreviewAPI] VITE_SUPABASE_URL is not set. Preview generation will fail.');
}
if (!SUPABASE_ANON_KEY) {
  console.warn('[StylePreviewAPI] VITE_SUPABASE_ANON_KEY is not set. Preview generation will fail.');
}

export type PreviewGenerationResult =
  | { status: 'complete'; previewUrl: string; isAuthenticated: boolean }
  | { status: 'processing'; previewUrl: null; requestId: string; isAuthenticated: boolean };

export interface PreviewStatusResult {
  request_id: string;
  status: string;
  preview_url?: string | null;
  error?: string | null;
}

const defaultHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  return headers;
};

export const generateStylePreview = async (
  imageUrl: string,
  style: string,
  photoId: string,
  aspectRatio: string,
  options: {
    watermark?: boolean;
    quality?: 'low' | 'medium' | 'high' | 'auto';
  } = {}
): Promise<PreviewGenerationResult> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials are not configured');
  }

  const requestBody = {
    imageUrl,
    style,
    photoId,
    aspectRatio,
    watermark: options.watermark !== false,
    quality: options.quality ?? 'medium',
    isAuthenticated: false,
  };

  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-style-preview`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Supabase function failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.preview_url) {
    return {
      status: 'complete',
      previewUrl: data.preview_url as string,
      isAuthenticated: Boolean(data.isAuthenticated),
    };
  }

  if (data.requestId) {
    return {
      status: 'processing',
      previewUrl: null,
      requestId: data.requestId as string,
      isAuthenticated: Boolean(data.isAuthenticated),
    };
  }

  throw new Error('Invalid response from preview function.');
};

export const fetchPreviewStatus = async (requestId: string): Promise<PreviewStatusResult> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials are not configured');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/generate-style-preview/status?requestId=${encodeURIComponent(requestId)}`,
    {
      method: 'GET',
      headers: defaultHeaders(),
    }
  );

  if (response.status === 404) {
    return {
      request_id: requestId,
      status: 'not_found',
      preview_url: null,
    };
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch preview status (${response.status})`);
  }

  return response.json() as Promise<PreviewStatusResult>;
};
