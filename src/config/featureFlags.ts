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

export const ENABLE_STORY_LAYER = coerceBoolean(
  import.meta.env.VITE_STORY_LAYER_ENABLED ?? 'true'
);

export const AUTH_GATE_ROLLOUT_PERCENT = coercePercentage(
  import.meta.env.VITE_AUTH_GATE_ROLLOUT ?? '0'
);

export const ENABLE_STUDIO_V2_INSIGHTS_RAIL = coerceBoolean(
  import.meta.env.VITE_STUDIO_V2_INSIGHTS_RAIL ?? 'false'
);

export const ENABLE_STUDIO_V2_CANVAS_MODAL = coerceBoolean(
  import.meta.env.VITE_STUDIO_V2_CANVAS_MODAL ?? 'false'
);

const ENABLE_STUDIO_V2_EXPERIENCE = coerceBoolean(
  import.meta.env.VITE_STUDIO_V2_EXPERIENCE ?? 'false'
);

/**
 * Master switch for the Studio v2 experience. Setting `VITE_STUDIO_V2_EXPERIENCE`
 * to true enables all v2 modules at once; otherwise toggles can be managed
 * individually during phased rollout.
 */
export const ENABLE_STUDIO_V2 = ENABLE_STUDIO_V2_EXPERIENCE
  ? true
  : ENABLE_STUDIO_V2_INSIGHTS_RAIL && ENABLE_STUDIO_V2_CANVAS_MODAL;
