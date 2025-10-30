import { describe, it, expect } from 'vitest';
import { STYLE_CORE_METADATA } from '@/config/styles/registryCore.generated';
import { canGenerateStylePreview } from '@/utils/entitlementGate';
import type { EntitlementState, SessionUser } from '@/store/useFounderStore';
import type { StyleTone } from '@/config/styles/types';

const createEntitlements = (
  tier: EntitlementState['tier'],
  overrides: Partial<EntitlementState> = {}
): EntitlementState => ({
  status: 'ready',
  tier,
  quota: 20,
  remainingTokens: 10,
  requiresWatermark: tier === 'free',
  priority: tier === 'pro' ? 'pro' : tier === 'creator' || tier === 'plus' ? 'priority' : 'normal',
  renewAt: null,
  lastSyncedAt: Date.now(),
  error: null,
  ...overrides,
});

const getStyleId = (tone: StyleTone, fallbackId: string): string => {
  const match = STYLE_CORE_METADATA.find((entry) => entry.tone === tone);
  return match?.id ?? fallbackId;
};

describe('Tone gating regression', () => {
  const freeStyleId = getStyleId('classic', 'classic-oil-painting');
  const premiumStyleId = getStyleId('signature', 'sanctuary-glow');

  const authenticatedUser: SessionUser = {
    id: 'user-free',
    email: 'free@wondertone.ai',
  };

  it('allows free tier user to generate classic tones', () => {
    const entitlements = createEntitlements('free');

    const result = canGenerateStylePreview({
      styleId: freeStyleId,
      entitlements,
      sessionUser: authenticatedUser,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('allowed');
  });

  it('locks premium tones for free tier until upgrade', () => {
    const entitlements = createEntitlements('free');

    const result = canGenerateStylePreview({
      styleId: premiumStyleId,
      entitlements,
      sessionUser: authenticatedUser,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('style_locked');
    expect(result.requiredTier).toBe('creator');
  });

  it('allows plus tier user to access premium tones', () => {
    const entitlements = createEntitlements('plus');

    const result = canGenerateStylePreview({
      styleId: premiumStyleId,
      entitlements,
      sessionUser: authenticatedUser,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('allowed');
  });

  it('blocks users when quota is exhausted', () => {
    const entitlements = createEntitlements('creator', { remainingTokens: 0 });

    const result = canGenerateStylePreview({
      styleId: freeStyleId,
      entitlements,
      sessionUser: authenticatedUser,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('quota_exceeded');
  });
});
