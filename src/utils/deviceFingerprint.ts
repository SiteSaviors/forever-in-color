const STORAGE_KEY = 'wt_fp_hash_v1';

export type DeviceFingerprint = {
  userAgent: string;
  language: string;
  platform: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  hardwareConcurrency: number;
  deviceMemory: number;
};

export const collectFingerprint = (): DeviceFingerprint => {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'ssr',
      language: 'en',
      platform: 'unknown',
      timezone: 'UTC',
      screenResolution: '0x0',
      colorDepth: 0,
      hardwareConcurrency: 0,
      deviceMemory: 0,
    };
  }

  const { navigator, screen, Intl: IntlGlobal } = window;

  const width = screen?.width ?? 0;
  const height = screen?.height ?? 0;
  const resolution = `${width}x${height}`;

  return {
    userAgent: navigator?.userAgent ?? 'unknown',
    language: navigator?.language ?? 'unknown',
    platform: navigator?.platform ?? 'unknown',
    timezone: IntlGlobal?.DateTimeFormat?.().resolvedOptions?.().timeZone ?? 'UTC',
    screenResolution: resolution,
    colorDepth: screen?.colorDepth ?? 0,
    hardwareConcurrency: navigator?.hardwareConcurrency ?? 0,
    deviceMemory: // @ts-expect-error deviceMemory is experimental
      typeof navigator?.deviceMemory === 'number' ? navigator.deviceMemory : 0,
  };
};

export const generateFingerprintHash = async (fingerprint: DeviceFingerprint): Promise<string> => {
  const orderedKeys = Object.keys(fingerprint).sort();
  const payload = orderedKeys.reduce<Record<string, unknown>>((acc, key) => {
    acc[key] = (fingerprint as Record<string, unknown>)[key];
    return acc;
  }, {});
  const str = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const getStoredFingerprintHash = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const persistFingerprintHash = (hash: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, hash);
  } catch {
    // ignore storage errors
  }
};

export const getOrCreateFingerprintHash = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return null;
  }

  const existing = getStoredFingerprintHash();
  if (existing) {
    return existing;
  }

  try {
    const fingerprint = collectFingerprint();
    const hash = await generateFingerprintHash(fingerprint);
    persistFingerprintHash(hash);
    return hash;
  } catch (error) {
    console.warn('[deviceFingerprint] Failed to compute fingerprint hash', error);
    return null;
  }
};

export const clearStoredFingerprintHash = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
