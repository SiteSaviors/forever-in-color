import { useCallback, useRef } from 'react';
import { trackStudioV2CanvasCtaClick, trackStudioV2OrientationCta } from '@/utils/studioV2Analytics';
import { useStudioPreviewState } from '@/store/hooks/studio/useStudioPreviewState';

type CanvasCtaHandlersArgs = {
  onOpenCanvas: (source: 'center' | 'rail') => void;
  onOrientationFallback: () => void;
  requestOrientationChange: (orientation: 'square' | 'horizontal' | 'vertical') => Promise<void>;
};

export const useCanvasCtaHandlers = ({
  onOpenCanvas,
  onOrientationFallback,
  requestOrientationChange,
}: CanvasCtaHandlersArgs) => {
  const {
    currentStyle,
    hasCroppedImage,
    orientation,
    orientationPreviewPending,
    previewHasData,
    previewReady,
  } = useStudioPreviewState();

  const centerCanvasThrottleRef = useRef<number>(0);
  const centerOrientationThrottleRef = useRef<number>(0);
  const railOrientationThrottleRef = useRef<number>(0);

  const handleCreateCanvasFromCenter = useCallback(() => {
    const now = Date.now();
    const style = currentStyle;
    const canTrack =
      !!style && hasCroppedImage && !orientationPreviewPending && (previewReady || previewHasData);

    if (canTrack && now - centerCanvasThrottleRef.current > 250) {
      trackStudioV2CanvasCtaClick({
        styleId: style.id,
        orientation,
        source: 'center',
      });
      centerCanvasThrottleRef.current = now;
    }

    onOpenCanvas('center');
  }, [
    currentStyle,
    hasCroppedImage,
    onOpenCanvas,
    orientation,
    orientationPreviewPending,
    previewHasData,
    previewReady,
  ]);

  const createOrientationHandler = useCallback(
    (source: 'center' | 'rail') => {
      const throttleRef = source === 'center' ? centerOrientationThrottleRef : railOrientationThrottleRef;

      return () => {
        const now = Date.now();
        if (currentStyle && now - throttleRef.current > 250) {
          trackStudioV2OrientationCta({
            styleId: currentStyle.id,
            orientation,
          });
          throttleRef.current = now;
        } else {
          throttleRef.current = now;
        }

        void requestOrientationChange(orientation).catch(() => {
          onOrientationFallback();
        });
      };
    },
    [currentStyle, onOrientationFallback, orientation, requestOrientationChange]
  );

  const handleChangeOrientationFromCenter = createOrientationHandler('center');
  const handleChangeOrientationFromRail = createOrientationHandler('rail');

  return {
    handleCreateCanvasFromCenter,
    handleChangeOrientationFromCenter,
    handleChangeOrientationFromRail,
  };
};

