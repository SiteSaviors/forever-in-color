
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleCorsPreflightRequest(): Response {
  console.log('✅ Handling CORS preflight request');
  return new Response(null, { 
    status: 200,
    headers: corsHeaders 
  });
}

export function createErrorResponse(
  error: string, 
  status: number = 500, 
  requestId?: string
): Response {
  return new Response(
    JSON.stringify({ 
      error: 'internal_server_error',
      message: error,
      requestId,
      timestamp: new Date().toISOString()
    }), 
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function createSuccessResponse(
  previewUrl: string, 
  requestId: string, 
  duration: number
): Response {
  return new Response(
    JSON.stringify({ 
      preview_url: previewUrl,
      requestId,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    }), 
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
