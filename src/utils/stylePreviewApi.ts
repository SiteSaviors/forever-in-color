const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type PreviewGenerationResult =
  | {
      status: 'complete';
      previewUrl: string;
      requiresWatermark: boolean;
      remainingTokens: number | null;
      tier?: string;
      priority?: string;
    }
  | {
      status: 'processing';
      previewUrl: null;
      requestId: string;
      requiresWatermark: boolean;
      remainingTokens: number | null;
      tier?: string;
      priority?: string;
    };

export interface PreviewStatusResult {
  request_id: string;
  status: string;
  preview_url?: string | null;
  error?: string | null;
}

const defaultHeaders = (overrides?: Record<string, string>) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(overrides ?? {})
  };
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
  }
  return headers;
};

export interface GeneratePreviewParams {
  imageUrl: string;
  style: string;
  photoId: string;
  aspectRatio: string;
  options?: {
    quality?: 'low' | 'medium' | 'high' | 'auto';
    idempotencyKey: string;
    anonToken?: string | null;
    accessToken?: string | null;
  };
}

export const generateStylePreview = async (
  params: GeneratePreviewParams
): Promise<PreviewGenerationResult> => {
  const { imageUrl, style, photoId, aspectRatio, options = {} } = params;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials are not configured');
  }

  if (!options.idempotencyKey) {
    throw new Error('Idempotency key is required for preview generation');
  }

  const headers: Record<string, string> = {
    ...defaultHeaders()
  };

  if (options.anonToken) {
    headers['X-WT-Anon'] = options.anonToken;
  }

  const authToken = options.accessToken ?? SUPABASE_ANON_KEY ?? null;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  headers['X-Idempotency-Key'] = options.idempotencyKey;

  // Note: watermark parameter removed - server determines based on entitlements
  const requestBody = {
    imageUrl,
    style,
    photoId,
    aspectRatio,
    quality: options.quality ?? 'medium',
    isAuthenticated: Boolean(options.accessToken),
  };

  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-style-preview`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    try {
      const errorPayload = JSON.parse(text);
      const message = errorPayload?.message ?? errorPayload?.error ?? text;
      const code = errorPayload?.code ?? errorPayload?.error;
      const err = new Error(message || `Supabase function failed (${response.status})`);
      (err as Error & { code?: string; remainingTokens?: number | null }).code = code ?? undefined;
      (err as Error & { code?: string; remainingTokens?: number | null }).remainingTokens = errorPayload?.remainingTokens ?? null;
      throw err;
    } catch {
      throw new Error(text || `Supabase function failed with status ${response.status}`);
    }
  }

  const data = await response.json();

  if (data.preview_url || data.previewUrl) {
    return {
      status: 'complete',
      previewUrl: (data.preview_url ?? data.previewUrl) as string,
      requiresWatermark: Boolean(
        data.requires_watermark ?? data.requiresWatermark ?? false
      ),
      remainingTokens: typeof data.remainingTokens === 'number' ? data.remainingTokens : null,
      tier: data.tier as string | undefined,
      priority: data.priority as string | undefined
    };
  }

  if (data.requestId) {
    return {
      status: 'processing',
      previewUrl: null,
      requestId: data.requestId as string,
      requiresWatermark: Boolean(
        data.requires_watermark ?? data.requiresWatermark ?? false
      ),
      remainingTokens: typeof data.remainingTokens === 'number' ? data.remainingTokens : null,
      tier: data.tier as string | undefined,
      priority: data.priority as string | undefined
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
