import { useCallback } from 'react';
import type { GateResult } from '@/utils/entitlementGate';
import { useFounderStore } from '@/store/useFounderStore';

type HandleStyleSelectOptions = {
  onGateDenied?: (gate: GateResult) => void;
};

export const useHandleStyleSelect = (options?: HandleStyleSelectOptions) => {
  const onGateDenied = options?.onGateDenied;

  return useCallback(
    (styleId: string) => {
      const state = useFounderStore.getState();
      state.selectStyle(styleId);

      const style = state.styles.find((item) => item.id === styleId);
      if (!style) return;

      const gate = state.evaluateStyleGate(styleId);

      if (style.id === 'original-image' && state.croppedImage) {
        const timestamp = Date.now();
        state.setPreviewState('original-image', {
          status: 'ready',
          data: {
            previewUrl: state.croppedImage,
            watermarkApplied: false,
            startedAt: timestamp,
            completedAt: timestamp,
          },
          orientation: state.orientation,
        });
        return;
      }

      if (!gate.allowed) {
        if (gate.reason === 'quota_exceeded') {
          state.setShowQuotaModal(true);
        }
        onGateDenied?.(gate);
        return;
      }

      void state.startStylePreview(style);
    },
    [onGateDenied]
  );
};
