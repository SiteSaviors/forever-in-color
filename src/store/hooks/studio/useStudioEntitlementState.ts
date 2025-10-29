import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useStudioEntitlementState = () =>
  useFounderStore(
    (state) => {
      const entitlements = state.entitlements;
      const displayRemainingTokens = state.getDisplayableRemainingTokens();
      const userTier = entitlements.tier;
      const requiresWatermark = entitlements.requiresWatermark;

      return {
        entitlements,
        displayRemainingTokens,
        firstPreviewCompleted: state.firstPreviewCompleted,
        generationCount: state.generationCount,
        userTier,
        requiresWatermark,
        isPremiumUser: !requiresWatermark,
      };
    },
    shallow
  );
