import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useEntitlementsState = () =>
  useFounderStore(
    (state) => ({
      entitlements: state.entitlements,
      userTier: state.entitlements?.tier ?? 'free',
      requiresWatermark: state.entitlements?.requiresWatermark ?? true,
      displayRemainingTokens: state.getDisplayableRemainingTokens(),
      showTokenToast: state.showTokenToast,
      showQuotaModal: state.showQuotaModal,
      generationCount: state.generationCount,
      generationLimit: state.getGenerationLimit(),
    }),
    shallow
  );

export const useEntitlementsActions = () =>
  useFounderStore(
    (state) => ({
      hydrateEntitlements: state.hydrateEntitlements,
      setShowTokenToast: state.setShowTokenToast,
      setShowQuotaModal: state.setShowQuotaModal,
      updateEntitlementsFromResponse: state.updateEntitlementsFromResponse,
      incrementGenerationCount: state.incrementGenerationCount,
      canGenerateMore: state.canGenerateMore,
      evaluateStyleGate: state.evaluateStyleGate,
      canUseStyle: state.canUseStyle,
    }),
    shallow
  );
