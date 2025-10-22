import {
  normalizePreviewResponse,
  parsePreviewRequest,
  parsePreviewStatusResponse,
  type PreviewRequest,
  type PreviewResponse,
  type PreviewStatusResponse,
} from '../../shared/validation/previewSchemas';
import { REQUIRE_AUTH_FOR_PREVIEW } from '@/config/featureFlags';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type PreviewGenerationResult = PreviewResponse;
export type PreviewStatusResult = PreviewStatusResponse;

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
    quality?: PreviewRequest['quality'];
    idempotencyKey: string;
    anonToken?: string | null;
    accessToken?: string | null;
    fingerprintHash?: string | null;
    cacheBypass?: boolean;
  };
}

export const generateStylePreview = async (
  params: GeneratePreviewParams
): Promise<PreviewGenerationResult> => {
  const { imageUrl, style, photoId, aspectRatio, options = {} } = params;
  const requireAuth = REQUIRE_AUTH_FOR_PREVIEW;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials are not configured');
  }

  if (!options.idempotencyKey) {
    throw new Error('Idempotency key is required for preview generation');
  }

  const headers: Record<string, string> = {
    ...defaultHeaders()
  };

  if (!requireAuth && options.anonToken) {
    headers['X-WT-Anon'] = options.anonToken;
  }

  const authToken = options.accessToken ?? SUPABASE_ANON_KEY ?? null;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  headers['X-Idempotency-Key'] = options.idempotencyKey;

  // Note: watermark parameter removed - server determines based on entitlements
  const requestBody = parsePreviewRequest({
    imageUrl,
    style,
    photoId,
    aspectRatio,
    quality: options.quality,
    cacheBypass: options.cacheBypass,
    fingerprintHash: requireAuth ? null : options.fingerprintHash ?? null,
    isAuthenticated: Boolean(options.accessToken),
  });

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

  return normalizePreviewResponse(data);
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

  const data = await response.json();
  return parsePreviewStatusResponse(data);
};
