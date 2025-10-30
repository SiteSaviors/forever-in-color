import { useCallback } from 'react';
import type { GateResult } from '@/utils/entitlementGate';
import { useFounderStore } from '@/store/useFounderStore';
import { emitStepOneEvent } from '@/utils/telemetry';

type HandleStyleGateDeniedPayload = {
  gate: GateResult;
  styleId: string;
  tone?: string;
};

type HandleStyleSelectOptions = {
  onGateDenied?: (payload: HandleStyleGateDeniedPayload) => void;
};

type HandleStyleSelectMeta = {
  tone?: string;
};

export const useHandleStyleSelect = (options?: HandleStyleSelectOptions) => {
  const onGateDenied = options?.onGateDenied;

  return useCallback(
    (styleId: string, meta?: HandleStyleSelectMeta) => {
      const state = useFounderStore.getState();
      state.selectStyle(styleId);

      const style = state.styles.find((item) => item.id === styleId);
      if (!style) return;

      const gate = state.evaluateStyleGate(styleId);

      if (style.id === 'original-image' && state.croppedImage) {
        emitStepOneEvent({ type: 'tone_style_select', styleId, tone: meta?.tone });
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
        onGateDenied?.({ gate, styleId, tone: meta?.tone });
        emitStepOneEvent({
          type: 'tone_style_locked',
          styleId,
          tone: meta?.tone,
          requiredTier: gate.requiredTier ?? null,
        });
        return;
      }

      emitStepOneEvent({ type: 'tone_style_select', styleId, tone: meta?.tone });

      const hasBaseImage = Boolean(state.croppedImage || state.uploadedImage);
      if (!hasBaseImage) {
        state.requestUpload({ preselectedStyleId: styleId });
        return;
      }

      emitStepOneEvent({ type: 'substep', value: 'style-selection' });
      void state.startStylePreview(style);
    },
    [onGateDenied]
  );
};
