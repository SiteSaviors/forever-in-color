
export const REPLICATE_CONFIG = {
  baseUrl: "https://api.replicate.com/v1",
  model: "bytedance/seedream-4",
  defaultOutputFormat: "jpg",
  maxPollAttempts: 30,
  pollIntervalMs: 2000,
  timeoutMinutes: 2
} as const;

const PREVIEW_TIMING_DEFAULTS = {
  maxAttempts: REPLICATE_CONFIG.maxPollAttempts,
  pollIntervalMs: REPLICATE_CONFIG.pollIntervalMs,
  retryAttempts: 3,
  retryBaseMs: 5000
} as const;

type EnvGetter = (name: string) => string | undefined;

const getEnvValue = (key: string): string | undefined => {
  const denoEnv = (globalThis as { Deno?: { env?: { get?: EnvGetter } } }).Deno?.env;
  return typeof denoEnv?.get === "function" ? denoEnv.get(key) : undefined;
};

const parsePositiveInt = (rawValue: string | undefined, fallback: number): number => {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export interface PreviewTimingConfig {
  maxAttempts: number;
  pollIntervalMs: number;
  retryAttempts: number;
  retryBaseMs: number;
}

export const resolvePreviewTimingConfig = (): PreviewTimingConfig => {
  const maxAttempts = parsePositiveInt(getEnvValue("PREVIEW_MAX_ATTEMPTS"), PREVIEW_TIMING_DEFAULTS.maxAttempts);
  const pollIntervalMs = parsePositiveInt(getEnvValue("PREVIEW_POLL_INTERVAL_MS"), PREVIEW_TIMING_DEFAULTS.pollIntervalMs);
  const retryAttempts = parsePositiveInt(getEnvValue("PREVIEW_MAX_RETRIES"), PREVIEW_TIMING_DEFAULTS.retryAttempts);
  const retryBaseMs = parsePositiveInt(getEnvValue("PREVIEW_RETRY_BASE_MS"), PREVIEW_TIMING_DEFAULTS.retryBaseMs);

  return {
    maxAttempts,
    pollIntervalMs,
    retryAttempts,
    retryBaseMs
  };
};

export const IDENTITY_PRESERVATION_RULES = `

IMPORTANT IDENTITY PRESERVATION RULES:
- Keep the EXACT same facial structure and bone structure
- Maintain IDENTICAL eye color and eye shape
- Preserve the EXACT same nose, mouth, and jawline
- Do not change hair color, length, or style
- Keep the EXACT same skin tone and complexion
- Maintain identical body posture and positioning
- Preserve all clothing and accessories exactly as shown
- Do not add, remove, or modify any person's features
- This is the SAME PERSON, just in a different artistic style`;
