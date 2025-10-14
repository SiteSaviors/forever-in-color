export const buildCorsHeaders = (origin?: string) => ({
  'Access-Control-Allow-Origin': origin ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wt-anon, x-idempotency-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
});

export function handleCorsPreflightRequest(origin?: string): Response {
  return new Response(null, { headers: buildCorsHeaders(origin) });
}

export function createCorsResponse(body: string, status: number = 200, origin?: string): Response {
  return new Response(body, {
    status,
    headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
  });
}
