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

export const ENABLE_PREVIEW_QUERY_EXPERIMENT = coerceBoolean(
  import.meta.env.VITE_ENABLE_PREVIEW_QUERY ?? 'false'
);
