import type { CacheStatus } from './types.ts';

export function createSuccessResponse(
  generatedImageUrl: string,
  requestId: string,
  duration: number,
  cacheStatus: CacheStatus = 'miss'
) {
  return {
    preview_url: generatedImageUrl,
    requestId,
    cacheStatus,
    duration,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(error: string, message: string, requestId?: string) {
  return {
    error,
    message,
    ...(requestId && { requestId }),
    timestamp: new Date().toISOString()
  };
}
