import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFounderStore } from '@/store/useFounderStore';

const captureEntitlements = () => ({ ...useFounderStore.getState().entitlements });

describe('entitlementSlice consumePreviewToken', () => {
  let initialEntitlements: ReturnType<typeof captureEntitlements>;

  beforeEach(() => {
    initialEntitlements = captureEntitlements();
  });

  afterEach(() => {
    useFounderStore.setState({ entitlements: initialEntitlements });
  });

  it('consumes premium tokens before free tokens', () => {
    useFounderStore.setState((state) => ({
      entitlements: {
        ...state.entitlements,
        tier: 'free',
        premiumTokens: 3,
        freeMonthlyTokens: 5,
        remainingTokens: 8,
        hasPremiumAccess: true,
        requiresWatermark: false,
      },
    }));

    useFounderStore.getState().consumePreviewToken();

    const entitlements = useFounderStore.getState().entitlements;
    expect(entitlements.premiumTokens).toBe(2);
    expect(entitlements.freeMonthlyTokens).toBe(5);
    expect(entitlements.hasPremiumAccess).toBe(true);
    expect(entitlements.remainingTokens).toBe(7);
  });

  it('falls back to free tokens when premium exhausted', () => {
    useFounderStore.setState((state) => ({
      entitlements: {
        ...state.entitlements,
        tier: 'free',
        premiumTokens: 0,
        freeMonthlyTokens: 4,
        remainingTokens: 4,
        hasPremiumAccess: false,
        requiresWatermark: true,
      },
    }));

    useFounderStore.getState().consumePreviewToken();

    const entitlements = useFounderStore.getState().entitlements;
    expect(entitlements.premiumTokens).toBe(0);
    expect(entitlements.freeMonthlyTokens).toBe(3);
    expect(entitlements.hasPremiumAccess).toBe(false);
    expect(entitlements.remainingTokens).toBe(3);
    expect(entitlements.requiresWatermark).toBe(true);
  });

  it('falls back to aggregate remaining tokens when buckets missing', () => {
    useFounderStore.setState((state) => ({
      entitlements: {
        ...state.entitlements,
        tier: 'creator',
        premiumTokens: null,
        freeMonthlyTokens: null,
        remainingTokens: 10,
        hasPremiumAccess: true,
        requiresWatermark: false,
      },
    }));

    useFounderStore.getState().consumePreviewToken();

    const entitlements = useFounderStore.getState().entitlements;
    expect(entitlements.remainingTokens).toBe(9);
    expect(entitlements.hasPremiumAccess).toBe(true);
    expect(entitlements.requiresWatermark).toBe(false);
  });
});
