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
}

export function createSuccessResponse({
  previewUrl,
  requestId,
  duration,
  cacheStatus = 'miss',
  tier,
  requiresWatermark,
  remainingTokens,
  priority
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
