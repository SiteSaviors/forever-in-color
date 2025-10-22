/**
 * Centralized feature flags. All values default to `false` and can be enabled
 * via Vite environment variables (e.g. VITE_ENABLE_PREVIEW_QUERY=true).
 *
 * Phase 1 introduces React Query scaffolding behind a flag so we can wire new
 * preview orchestration without impacting the current production flow.
 */
const coerceBoolean = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  return value.toLowerCase() === 'true';
};

const coercePercentage = (value: unknown): number => {
  if (typeof value !== 'string') return 0;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 100) return 100;
  return parsed;
};

export const ENABLE_PREVIEW_QUERY_EXPERIMENT = coerceBoolean(
  import.meta.env.VITE_ENABLE_PREVIEW_QUERY ?? 'false'
);

export const REQUIRE_AUTH_FOR_PREVIEW = coerceBoolean(
  import.meta.env.VITE_REQUIRE_AUTH_FOR_PREVIEW ?? 'false'
);

export const AUTH_GATE_ROLLOUT_PERCENT = coercePercentage(
  import.meta.env.VITE_AUTH_GATE_ROLLOUT ?? '0'
);
