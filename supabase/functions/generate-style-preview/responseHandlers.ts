
export function handleSuccess(output: string, corsHeaders: Record<string, string>, requestId?: string) {
  
  return new Response(
    JSON.stringify({
      success: true,
      preview_url: output,
      timestamp: new Date().toISOString(),
      requestId: requestId || 'unknown'
    }),
    { 
      status: 200, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

export function handleError(
  error: string, 
  corsHeaders: Record<string, string>, 
  status: number = 400,
  requestId?: string
) {
  
  return new Response(
    JSON.stringify({
      success: false,
      error: error,
      timestamp: new Date().toISOString(),
      requestId: requestId || 'unknown'
    }),
    { 
      status, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
