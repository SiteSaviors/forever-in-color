const FILTER_STORAGE_KEY = 'stock_library_filters';
const FILTER_SCHEMA_VERSION = 1;

export type AccessFilters = { free: boolean; premium: boolean };
export type OrientationFilters = { horizontal: boolean; vertical: boolean; square: boolean };

type PersistedFilters = {
  version: number;
  accessFilters: AccessFilters;
  orientationFilters: OrientationFilters;
};

const isValidPersistedFilters = (value: unknown): value is PersistedFilters => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.version === 'number' &&
    typeof record.accessFilters === 'object' &&
    typeof record.orientationFilters === 'object'
  );
};

export const loadPersistedFilters = (): null | {
  accessFilters: AccessFilters;
  orientationFilters: OrientationFilters;
} => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidPersistedFilters(parsed) || parsed.version !== FILTER_SCHEMA_VERSION) {
      return null;
    }
    return {
      accessFilters: parsed.accessFilters,
      orientationFilters: parsed.orientationFilters,
    };
  } catch {
    return null;
  }
};

export const persistFilters = (accessFilters: AccessFilters, orientationFilters: OrientationFilters) => {
  if (typeof window === 'undefined') return;
  try {
    const payload: PersistedFilters = {
      version: FILTER_SCHEMA_VERSION,
      accessFilters,
      orientationFilters,
    };
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.)
  }
};
