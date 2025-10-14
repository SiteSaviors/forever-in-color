import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const COOKIE_NAME = 'wt_anon_token';
const TOKEN_PREFIX = 'wt_anon_';
const HARD_LIMIT = 10;
const SOFT_LIMIT = 5;

const readJsonSafe = async (req: Request): Promise<Record<string, unknown> | null> => {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return null;
    }
    return await req.json();
  } catch {
    return null;
  }
};

const parseCookies = (cookieHeader: string | null): Record<string, string> => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [name, ...valueParts] = part.trim().split('=');
    if (!name) return acc;
    acc[name] = decodeURIComponent(valueParts.join('=') ?? '');
    return acc;
  }, {});
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const sha256 = async (value: string): Promise<string> => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return toHex(digest);
};

const firstOfMonthUtc = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const nextMonthUtc = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));

const createAnonToken = (): string => `${TOKEN_PREFIX}${crypto.randomUUID().replace(/-/g, '')}`;

const makeResponse = (payload: unknown, origin: string | null, cookie?: string, status = 200): Response => {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Credentials': 'true'
  });
  if (cookie) {
    headers.set('Set-Cookie', cookie);
  }
  return new Response(JSON.stringify(payload), { status, headers });
};

serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin ?? '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }

  if (req.method !== 'POST') {
    return makeResponse({ error: 'method_not_allowed' }, origin, undefined, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return makeResponse({ error: 'configuration_error' }, origin, undefined, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const body = await readJsonSafe(req);

  const cookies = parseCookies(req.headers.get('cookie'));
  const bodyToken = typeof body?.token === 'string' ? body.token.trim() : '';
  let anonToken = bodyToken || cookies[COOKIE_NAME] || createAnonToken();

  if (!anonToken.startsWith(TOKEN_PREFIX)) {
    anonToken = `${TOKEN_PREFIX}${anonToken.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  }

  const now = new Date();
  const monthStart = firstOfMonthUtc(now);
  const monthEnd = nextMonthUtc(now);
  const monthBucket = monthStart.toISOString().slice(0, 10);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const userAgent = req.headers.get('user-agent') ?? '';
  const ipUaHash = await sha256(`${ip}|${userAgent}`);

  const { data: anonRow } = await supabase
    .from('anonymous_tokens')
    .select('token, dismissed_prompt, month_bucket')
    .eq('token', anonToken)
    .maybeSingle();

  let dismissedPrompt = Boolean(anonRow?.dismissed_prompt);

  if (typeof body?.dismissed_prompt === 'boolean') {
    dismissedPrompt = body.dismissed_prompt;
  }

  if (!anonRow) {
    await supabase.from('anonymous_tokens').insert({
      token: anonToken,
      free_tokens_remaining: SOFT_LIMIT,
      dismissed_prompt: dismissedPrompt,
      ip_ua_hash: ipUaHash,
      month_bucket: monthBucket
    });
  } else if (anonRow.month_bucket !== monthBucket) {
    await supabase
      .from('anonymous_tokens')
      .update({
        free_tokens_remaining: SOFT_LIMIT,
        dismissed_prompt: dismissedPrompt,
        ip_ua_hash: ipUaHash,
        month_bucket: monthBucket
      })
      .eq('token', anonToken);
  } else if (typeof body?.dismissed_prompt === 'boolean') {
    await supabase
      .from('anonymous_tokens')
      .update({ dismissed_prompt: dismissedPrompt, ip_ua_hash: ipUaHash })
      .eq('token', anonToken);
  }

  const { data: usages } = await supabase
    .from('preview_logs')
    .select('tokens_spent')
    .eq('anon_token', anonToken)
    .eq('outcome', 'success')
    .gte('created_at', monthStart.toISOString())
    .lt('created_at', monthEnd.toISOString());

  const tokensUsed = usages?.reduce((sum, row) => sum + (row.tokens_spent ?? 0), 0) ?? 0;
  const hardRemaining = Math.max(HARD_LIMIT - tokensUsed, 0);
  const softRemaining = Math.max(SOFT_LIMIT - Math.min(tokensUsed, SOFT_LIMIT), 0);

  await supabase
    .from('anonymous_tokens')
    .update({ free_tokens_remaining: softRemaining })
    .eq('token', anonToken);

  const cookie = `${COOKIE_NAME}=${encodeURIComponent(anonToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Secure`;

  return makeResponse(
    {
      anon_token: anonToken,
      free_tokens_remaining: softRemaining,
      hard_remaining: hardRemaining,
      soft_limit: SOFT_LIMIT,
      hard_limit: HARD_LIMIT,
      dismissed_prompt: dismissedPrompt
    },
    origin,
    cookie
  );
});
