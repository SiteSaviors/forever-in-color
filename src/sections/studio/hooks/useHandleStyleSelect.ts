import { useCallback } from 'react';
import { useFounderStore } from '@/store/useFounderStore';

export const useHandleStyleSelect = () => {
  return useCallback((styleId: string) => {
    const state = useFounderStore.getState();
    state.selectStyle(styleId);

    const style = state.styles.find((item) => item.id === styleId);
    if (!style) return;

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

    if (!state.canGenerateMore()) {
      return;
    }

    void state.startStylePreview(style);
  }, []);
};
