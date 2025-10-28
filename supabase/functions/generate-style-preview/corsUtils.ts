// Base allowlist covers production domains; extend via WT_PREVIEW_ALLOWED_ORIGINS (comma-separated).
const DEFAULT_ALLOWED_ORIGINS = [
  'https://wondertone.ai',
  'https://www.wondertone.ai',
  'https://app.wondertone.ai',
];

const LOCALHOST_PREFIXES = ['http://localhost', 'http://127.0.0.1'];

const ORIGIN_PATTERNS = [/^https:\/\/([a-z0-9-]+\.)?wondertone\.ai$/i];

const parseEnvAllowedOrigins = (): string[] => {
  const raw = (Deno.env.get('WT_PREVIEW_ALLOWED_ORIGINS') ?? '').trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

const allowedOriginSet = new Set<string>([
  ...DEFAULT_ALLOWED_ORIGINS,
  ...parseEnvAllowedOrigins(),
]);

const DEFAULT_FALLBACK_ORIGIN = (() => {
  const iterator = allowedOriginSet.values();
  const first = iterator.next();
  return first.done ? 'https://wondertone.com' : first.value;
})();

const isLocalhostOrigin = (origin: string): boolean =>
  LOCALHOST_PREFIXES.some((prefix) => origin.startsWith(prefix));

const isAllowedByPattern = (origin: string): boolean =>
  ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));

const isOriginAllowed = (origin: string): boolean =>
  allowedOriginSet.has(origin) || isAllowedByPattern(origin) || isLocalhostOrigin(origin);

const resolveAllowedOrigin = (origin?: string | null): string => {
  if (origin) {
    const trimmed = origin.trim();
    if (trimmed && trimmed.toLowerCase() !== 'null' && isOriginAllowed(trimmed)) {
      return trimmed;
    }
  }
  return DEFAULT_FALLBACK_ORIGIN;
};

export const buildCorsHeaders = (origin?: string | null) => ({
  'Access-Control-Allow-Origin': resolveAllowedOrigin(origin),
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-idempotency-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin',
});

export function handleCorsPreflightRequest(origin?: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...buildCorsHeaders(origin),
      'Access-Control-Max-Age': '86400',
    },
  });
}

export function createCorsResponse(body: string, status: number = 200, origin?: string | null): Response {
  return new Response(body, {
    status,
    headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' }
  });
}
