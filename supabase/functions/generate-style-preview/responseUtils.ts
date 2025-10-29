import type { CacheStatus } from './types.ts';

export interface SuccessResponseMeta {
  previewUrl: string;
  requestId: string;
  duration: number;
  cacheStatus?: CacheStatus;
  tier?: string;
  requiresWatermark?: boolean;
  remainingTokens?: number | null;
  priority?: string;
  storageUrl?: string | null;
  storagePath?: string | null;
  softRemaining?: number | null;
  sourceStoragePath?: string | null;
  sourceDisplayUrl?: string | null;
  previewLogId?: string | null;
  cropConfig?: Record<string, unknown> | null;
}

export function createSuccessResponse({
  previewUrl,
  requestId,
  duration,
  cacheStatus = 'miss',
  tier,
  requiresWatermark,
  remainingTokens,
  priority,
  storageUrl,
  storagePath,
  softRemaining,
  sourceStoragePath,
  sourceDisplayUrl,
  previewLogId,
  cropConfig
}: SuccessResponseMeta) {
  return {
    preview_url: previewUrl,
    previewUrl,
    requestId,
    cacheStatus,
    duration,
    tier,
    requires_watermark: requiresWatermark,
    remainingTokens,
    priority,
    storageUrl,
    storagePath,
    softRemaining,
    sourceStoragePath,
    sourceDisplayUrl,
    previewLogId,
    preview_log_id: previewLogId ?? null,
    cropConfig,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(error: string, message: string, requestId?: string, code?: string) {
  return {
    error,
    message,
    code: code ?? error,
    ...(requestId && { requestId }),
    timestamp: new Date().toISOString()
  };
}
