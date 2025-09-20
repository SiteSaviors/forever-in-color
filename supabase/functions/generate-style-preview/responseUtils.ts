export function createSuccessResponse(generatedImageUrl: string, requestId: string, duration: number) {
  return {
    preview_url: generatedImageUrl,
    requestId,
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