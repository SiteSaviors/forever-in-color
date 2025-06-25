
export function handleSuccess(output: string, corsHeaders: Record<string, string>) {
  return Response.json(
    {
      success: true,
      preview_url: output,
      timestamp: new Date().toISOString()
    },
    { 
      status: 200, 
      headers: corsHeaders 
    }
  );
}

export function handleError(
  error: string, 
  corsHeaders: Record<string, string>, 
  status: number = 400
) {
  return Response.json(
    {
      success: false,
      error: error,
      timestamp: new Date().toISOString()
    },
    { 
      status, 
      headers: corsHeaders 
    }
  );
}
