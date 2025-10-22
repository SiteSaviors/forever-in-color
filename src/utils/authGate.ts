import { AUTH_GATE_ROLLOUT_PERCENT, REQUIRE_AUTH_FOR_PREVIEW } from '@/config/featureFlags';
import { getStoredFingerprintHash } from './deviceFingerprint';

const BUCKET_STORAGE_KEY = 'wt_auth_gate_bucket_v1';

const clampBucket = (value: number): number => {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 99) return 99;
  return Math.trunc(value);
};

const hashToBucket = (seed: string): number => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    const char = seed.charCodeAt(index);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) % 100;
};

const readStoredBucket = (): number | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUCKET_STORAGE_KEY);
    if (raw == null) {
      return null;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return clampBucket(parsed);
  } catch {
    return null;
  }
};

const persistBucket = (bucket: number) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BUCKET_STORAGE_KEY, String(clampBucket(bucket)));
  } catch {
    // ignore storage failures
  }
};

const generateBucket = (): number => {
  if (typeof window === 'undefined') {
    return 100; // assume no gating during SSR
  }

  const fingerprint = getStoredFingerprintHash();
  if (fingerprint) {
    return hashToBucket(fingerprint);
  }

  try {
    const randomSeed = `${window.location.hostname}-${Math.random().toString(36).slice(2)}`;
    return hashToBucket(randomSeed);
  } catch {
    return Math.floor(Math.random() * 100);
  }
};

export const getAuthGateRolloutBucket = (): number => {
  const stored = readStoredBucket();
  if (stored != null) {
    return stored;
  }
  const bucket = clampBucket(generateBucket());
  persistBucket(bucket);
  return bucket;
};

export const shouldRequireAuthGate = (sessionUserId: string | null): boolean => {
  if (sessionUserId) {
    return false;
  }
  if (REQUIRE_AUTH_FOR_PREVIEW) {
    return true;
  }

  const rollout = AUTH_GATE_ROLLOUT_PERCENT;
  if (!rollout || rollout <= 0) {
    return false;
  }

  const bucket = getAuthGateRolloutBucket();
  return bucket < rollout;
};
