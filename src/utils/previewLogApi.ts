import type { Orientation } from '@/utils/imageUtils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const ENDPOINT = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/create-preview-log` : null;

type CreatePreviewLogParams = {
  storagePath: string;
  orientation: Orientation;
  styleId?: string;
  displayUrl?: string | null;
  cropConfig?: Record<string, unknown> | null;
  accessToken?: string | null;
};

type CreatePreviewLogSuccess = { ok: true; previewLogId: string };
type CreatePreviewLogFailure = { ok: false; error: string };

export type CreatePreviewLogResult = CreatePreviewLogSuccess | CreatePreviewLogFailure;

export async function createPreviewLog({
  storagePath,
  orientation,
  styleId = 'original-image',
  displayUrl = null,
  cropConfig = null,
  accessToken,
}: CreatePreviewLogParams): Promise<CreatePreviewLogResult> {
  if (!ENDPOINT || !SUPABASE_ANON_KEY) {
    return { ok: false, error: 'configuration_error' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    };

    const token = accessToken ?? SUPABASE_ANON_KEY;
    headers.Authorization = `Bearer ${token}`;

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        storagePath,
        orientation,
        styleId,
        displayUrl,
        cropConfig,
      }),
    });

    const json = (await response.json().catch(() => null)) as { previewLogId?: string; error?: string } | null;

    if (!response.ok || !json?.previewLogId) {
      return { ok: false, error: json?.error ?? 'preview_log_create_failed' };
    }

    return { ok: true, previewLogId: json.previewLogId };
  } catch (error) {
    console.error('[previewLogApi] Failed to create preview log', error);
    return { ok: false, error: 'network_error' };
  }
}
