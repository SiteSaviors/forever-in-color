const DEFAULT_TTL_MS = 15 * 60 * 1000;

interface PromptCacheEntry {
  prompt: string;
  styleId: number;
  styleVersion: string;
  fetchedAt: number;
  source: 'db' | 'fallback' | 'warmup';
}

interface PromptCacheConfig {
  enabled: boolean;
  ttlMs: number;
  warmupStyles: string[];
}

const cache = new Map<string, PromptCacheEntry>();
let cachedConfig: PromptCacheConfig | null = null;
let warmupPromise: Promise<void> | null = null;

function normalizeStyleName(styleName: string): string {
  return styleName.trim().toLowerCase();
}

function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (!value) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function resolvePromptCacheConfig(): PromptCacheConfig {
  const enabled = parseBoolean(Deno.env.get('ENABLE_PROMPT_CACHE'));
  const ttlOverride = Number(Deno.env.get('PROMPT_CACHE_TTL_MS'));
  const ttlMs = Number.isFinite(ttlOverride) && ttlOverride > 0 ? ttlOverride : DEFAULT_TTL_MS;
  const warmupRaw = Deno.env.get('PROMPT_CACHE_WARMUP_STYLES') ?? '';
  const warmupStyles = warmupRaw
    .split(',')
    .map((style) => style.trim())
    .filter((style) => style.length > 0);

  return {
    enabled,
    ttlMs,
    warmupStyles,
  };
}

export function getPromptCacheConfig(): PromptCacheConfig {
  if (!cachedConfig) {
    cachedConfig = resolvePromptCacheConfig();
  }
  return cachedConfig;
}

export interface PromptCacheHit {
  prompt: string;
  styleId: number;
  styleVersion: string;
  ageMs: number;
  source: PromptCacheEntry['source'];
}

export function getCachedPrompt(styleName: string): PromptCacheHit | null {
  const config = getPromptCacheConfig();
  if (!config.enabled) {
    return null;
  }

  const key = normalizeStyleName(styleName);
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  const ageMs = Date.now() - entry.fetchedAt;
  if (ageMs > config.ttlMs) {
    cache.delete(key);
    return null;
  }

  return {
    prompt: entry.prompt,
    styleId: entry.styleId,
    styleVersion: entry.styleVersion,
    ageMs,
    source: entry.source,
  };
}

export function setCachedPrompt(
  styleName: string,
  payload: { prompt: string; styleId: number; styleVersion: string },
  source: PromptCacheEntry['source']
): void {
  const config = getPromptCacheConfig();
  if (!config.enabled) {
    return;
  }

  const key = normalizeStyleName(styleName);
  cache.set(key, {
    prompt: payload.prompt,
    styleId: payload.styleId,
    styleVersion: payload.styleVersion,
    fetchedAt: Date.now(),
    source,
  });
}

export function invalidatePrompt(styleName?: string): void {
  if (!styleName) {
    cache.clear();
    return;
  }

  cache.delete(normalizeStyleName(styleName));
}

export interface PromptWarmupResult {
  prompt: string | null;
  styleId: number;
  styleVersion: string;
}

export function schedulePromptWarmup(
  fetcher: (styleName: string) => Promise<PromptWarmupResult | null>
): void {
  const config = getPromptCacheConfig();
  if (!config.enabled || config.warmupStyles.length === 0) {
    return;
  }

  if (!warmupPromise) {
    warmupPromise = (async () => {
      for (const styleName of config.warmupStyles) {
        try {
          const result = await fetcher(styleName);
          if (result?.prompt) {
            setCachedPrompt(styleName, {
              prompt: result.prompt,
              styleId: result.styleId,
              styleVersion: result.styleVersion
            }, 'warmup');
            console.log('[prompt-cache]', {
              action: 'warmup_populate',
              styleName,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('[prompt-cache]', {
            action: 'warmup_error',
            styleName,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    })();
  }

  warmupPromise.catch((error) => {
    console.error('[prompt-cache]', {
      action: 'warmup_unhandled',
      message: error instanceof Error ? error.message : String(error),
    });
  });
}
