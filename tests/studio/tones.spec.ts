import { describe, it, expect } from 'vitest';
import { STYLE_CATALOG } from '@/config/styleCatalog';
import { canGenerateStylePreview } from '@/utils/entitlementGate';
import type { EntitlementState, FingerprintStatus } from '@/store/founder/entitlementSlice';
import type { SessionUser } from '@/store/founder/sessionSlice';

const fingerprintReady: FingerprintStatus = 'ready';

const createAnonymousEntitlements = (overrides: Partial<EntitlementState> = {}): EntitlementState => ({
  status: 'ready',
  tier: 'anonymous',
  quota: 10,
  remainingTokens: 5,
  requiresWatermark: true,
  priority: 'normal',
  renewAt: null,
  hardLimit: 10,
  softRemaining: 5,
  hardRemaining: 5,
  softLimit: 5,
  dismissedPrompt: false,
  lastSyncedAt: 0,
  error: null,
  ...overrides,
});

const createPremiumEntitlements = (
  tier: 'creator' | 'plus' | 'pro',
  overrides: Partial<EntitlementState> = {}
): EntitlementState => ({
  status: 'ready',
  tier,
  quota: 20,
  remainingTokens: 10,
  requiresWatermark: tier === 'creator',
  priority: tier === 'pro' ? 'pro' : 'priority',
  renewAt: null,
  hardLimit: 20,
  softRemaining: null,
  hardRemaining: 10,
  softLimit: null,
  dismissedPrompt: false,
  lastSyncedAt: 0,
  error: null,
  ...overrides,
});

const getStyleId = (tone: string, fallbackId: string): string => {
  const match = STYLE_CATALOG.find((entry) => entry.tone === tone);
  return match?.id ?? fallbackId;
};

describe('Tone gating regression', () => {
  const freeStyleId = getStyleId('classic', 'classic-oil-painting');
  const premiumStyleId = getStyleId('signature', 'signature-aurora');

  const premiumUser: SessionUser = {
    id: 'user-plus',
    email: 'plus@wondertone.ai',
  };

  it('allows anonymous user to generate free tones', () => {
    const entitlements = createAnonymousEntitlements();

    const result = canGenerateStylePreview({
      styleId: freeStyleId,
      entitlements,
      sessionUser: null,
      fingerprintStatus: fingerprintReady,
      generationCount: 0,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('allowed');
  });

  it('blocks anonymous user from signature tones with upgrade messaging', () => {
    const entitlements = createAnonymousEntitlements();

    const result = canGenerateStylePreview({
      styleId: premiumStyleId,
      entitlements,
      sessionUser: null,
      fingerprintStatus: fingerprintReady,
      generationCount: 0,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('style_locked');
    expect(result.requiredTier).toBe('plus');
  });

  it('allows plus tier user to access signature tones', () => {
    const entitlements = createPremiumEntitlements('plus');

    const result = canGenerateStylePreview({
      styleId: premiumStyleId,
      entitlements,
      sessionUser: premiumUser,
      fingerprintStatus: fingerprintReady,
      generationCount: 0,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('allowed');
  });

  it('blocks users when quota is exhausted', () => {
    const entitlements = createPremiumEntitlements('plus', {
      remainingTokens: 0,
      hardRemaining: 0,
    });

    const result = canGenerateStylePreview({
      styleId: freeStyleId,
      entitlements,
      sessionUser: premiumUser,
      fingerprintStatus: fingerprintReady,
      generationCount: 0,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('quota_exceeded');
  });
});
