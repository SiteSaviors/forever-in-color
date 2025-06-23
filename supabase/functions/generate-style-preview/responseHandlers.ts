
export const createCorsResponse = () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Max-Age': '86400',
    }
  })
}

export const createSuccessResponse = (
  message: string, 
  previewUrl: string, 
  styleId: number | string, 
  styleName: string,
  warning?: string
) => {
  const response = {
    success: true,
    message,
    preview_url: previewUrl, // Use snake_case to match expected API format
    styleId,
    styleName,
    timestamp: new Date().toISOString(),
    ...(warning && { warning })
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

export const createErrorResponse = (error: string, status: number = 400, details?: string) => {
  const response = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    // Only include details in development or for non-sensitive errors
    ...(details && status < 500 && { details })
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
