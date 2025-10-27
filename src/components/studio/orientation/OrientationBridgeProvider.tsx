import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CANVAS_SIZE_OPTIONS, getDefaultSizeForOrientation } from '@/utils/canvasSizes';
import { cacheSmartCropResult, generateSmartCrop, ORIENTATION_PRESETS, type SmartCropResult } from '@/utils/smartCrop';
import type { Orientation } from '@/utils/imageUtils';
import { useFounderStore } from '@/store/useFounderStore';

const CropperModal = lazy(() => import('@/components/launchpad/cropper/CropperModal'));

type OrientationBridgeProviderProps = {
  children: ReactNode;
  onOrientationToast?: (orientationLabel: string) => void;
};

type OrientationBridgeContextValue = {
  requestOrientationChange: (orientation?: Orientation) => Promise<void>;
  cropperOpen: boolean;
  pendingOrientation: Orientation | null;
  orientationChanging: boolean;
  orientationPreviewPending: boolean;
  activeOrientation: Orientation;
};

const OrientationBridgeContext = createContext<OrientationBridgeContextValue | null>(null);

const OrientationBridgeProvider = ({ children, onOrientationToast }: OrientationBridgeProviderProps) => {
  const inFlightCropsRef = useRef<Map<Orientation, Promise<SmartCropResult>>>(new Map());
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingOrientation, setPendingOrientation] = useState<Orientation | null>(null);
  const previousGlobalHandlerRef = useRef<((orientation?: Orientation) => void) | undefined>();

  const orientation = useFounderStore((state) => state.orientation);
  const setOrientation = useFounderStore((state) => state.setOrientation);
  const orientationChanging = useFounderStore((state) => state.orientationChanging);
  const setOrientationChanging = useFounderStore((state) => state.setOrientationChanging);
  const orientationPreviewPending = useFounderStore((state) => state.orientationPreviewPending);
  const setOrientationPreviewPending = useFounderStore((state) => state.setOrientationPreviewPending);
  const setOrientationTip = useFounderStore((state) => state.setOrientationTip);
  const selectedSize = useFounderStore((state) => state.selectedCanvasSize);
  const setCanvasSize = useFounderStore((state) => state.setCanvasSize);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const startStylePreview = useFounderStore((state) => state.startStylePreview);
  const setPreviewState = useFounderStore((state) => state.setPreviewState);
  const originalImage = useFounderStore((state) => state.originalImage);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const originalImageDimensions = useFounderStore((state) => state.originalImageDimensions);
  const smartCrops = useFounderStore((state) => state.smartCrops);
  const setSmartCropForOrientation = useFounderStore((state) => state.setSmartCropForOrientation);
  const setCroppedImage = useFounderStore((state) => state.setCroppedImage);
  const markCropReady = useFounderStore((state) => state.markCropReady);

  const ensureSmartCropForOrientation = useCallback(
    async (orient: Orientation): Promise<SmartCropResult | null> => {
      if (!originalImage) return null;

      let nextResult = smartCrops[orient];

      if (!nextResult) {
        if (inFlightCropsRef.current.has(orient)) {
          nextResult = await inFlightCropsRef.current.get(orient)!;
        } else {
          const promise = generateSmartCrop(originalImage, orient)
            .then((result) => {
              setSmartCropForOrientation(orient, result);
              cacheSmartCropResult(originalImage, orient, result);
              return result;
            })
            .catch(() => {
              const fallback: SmartCropResult = {
                orientation: orient,
                dataUrl: originalImage,
                region: { x: 0, y: 0, width: 0, height: 0 },
                imageDimensions: originalImageDimensions ?? { width: 0, height: 0 },
                generatedAt: Date.now(),
                generatedBy: 'smart',
              };
              setSmartCropForOrientation(orient, fallback);
              cacheSmartCropResult(originalImage, orient, fallback);
              return fallback;
            })
            .finally(() => {
              inFlightCropsRef.current.delete(orient);
            });

          inFlightCropsRef.current.set(orient, promise);
          nextResult = await promise;
        }
      } else {
        cacheSmartCropResult(originalImage, orient, nextResult);
      }

      return nextResult;
    },
    [originalImage, originalImageDimensions, setSmartCropForOrientation, smartCrops]
  );

  const handleCropperDismiss = useCallback(() => {
    setCropperOpen(false);
    setPendingOrientation(null);
    setOrientationPreviewPending(false);
    setOrientationChanging(false);
  }, [setOrientationChanging, setOrientationPreviewPending]);

  const handleCropperComplete = useCallback(
    async (result: SmartCropResult) => {
      const targetOrientation = result.orientation;
      const orientationHasChanged = targetOrientation !== orientation;

      setSmartCropForOrientation(targetOrientation, result);
      if (originalImage) {
        cacheSmartCropResult(originalImage, targetOrientation, result);
      }
      setCroppedImage(result.dataUrl);
      markCropReady();
      setPreviewState('original-image', {
        status: 'ready',
        data: {
          previewUrl: result.dataUrl,
          watermarkApplied: false,
          startedAt: Date.now(),
          completedAt: Date.now(),
        },
        orientation: targetOrientation,
      });

      setCropperOpen(false);
      setPendingOrientation(null);
      setOrientation(targetOrientation);
      setOrientationTip(ORIENTATION_PRESETS[targetOrientation].description);

      const sizeOptionsForOrientation = CANVAS_SIZE_OPTIONS[targetOrientation];
      if (!sizeOptionsForOrientation.find((option) => option.id === selectedSize)) {
        setCanvasSize(getDefaultSizeForOrientation(targetOrientation));
      }

      const snapshot = useFounderStore.getState();
      const hasCachedPreview = currentStyle
        ? Boolean(snapshot.stylePreviewCache[currentStyle.id]?.[targetOrientation])
        : false;

      const shouldRegeneratePreview = Boolean(currentStyle) && currentStyle?.id !== 'original-image';

      if (shouldRegeneratePreview && currentStyle && !hasCachedPreview) {
        try {
          setOrientationPreviewPending(true);
          await startStylePreview(currentStyle, { force: true, orientationOverride: targetOrientation });
        } catch (error) {
          console.error('[OrientationBridge] Failed to regenerate preview for orientation change', error);
        } finally {
          setOrientationPreviewPending(false);
        }
      } else {
        setOrientationPreviewPending(false);
      }

      setOrientationChanging(false);
      if (orientationHasChanged) {
        onOrientationToast?.(ORIENTATION_PRESETS[targetOrientation].label);
      }
    },
    [
      currentStyle,
      markCropReady,
      onOrientationToast,
      originalImage,
      orientation,
      selectedSize,
      setCanvasSize,
      setCroppedImage,
      setOrientation,
      setOrientationChanging,
      setOrientationPreviewPending,
      setOrientationTip,
      setPreviewState,
      setSmartCropForOrientation,
      startStylePreview,
    ]
  );

  const handleOrientationSelect = useCallback(
    async (orient: Orientation) => {
      if (orientation === orient || orientationChanging || cropperOpen) return;

      if (!originalImage) {
        setOrientation(orient);
        setOrientationTip(ORIENTATION_PRESETS[orient].description);
        const sizeOptionsForOrientation = CANVAS_SIZE_OPTIONS[orient];
        if (!sizeOptionsForOrientation.find((option) => option.id === selectedSize)) {
          setCanvasSize(getDefaultSizeForOrientation(orient));
        }
        return;
      }

      setOrientationChanging(true);
      setPendingOrientation(orient);

      const nextResult = await ensureSmartCropForOrientation(orient);

      setOrientationChanging(false);

      if (!nextResult) {
        setPendingOrientation(null);
        setOrientation(orient);
        setOrientationTip(ORIENTATION_PRESETS[orient].description);
        return;
      }

      setCropperOpen(true);
    },
    [
      cropperOpen,
      ensureSmartCropForOrientation,
      orientation,
      orientationChanging,
      originalImage,
      selectedSize,
      setCanvasSize,
      setOrientation,
      setOrientationChanging,
      setOrientationTip,
    ]
  );

  const openOrientationCropper = useCallback(
    async (orient?: Orientation) => {
      const target = orient ?? orientation;
      if (!target) return;

      if (!croppedImage || !originalImage) {
        await handleOrientationSelect(target);
        return;
      }

      setPendingOrientation(target);
      await ensureSmartCropForOrientation(target);
      setCropperOpen(true);
    },
    [croppedImage, ensureSmartCropForOrientation, handleOrientationSelect, orientation, originalImage]
  );

  useEffect(() => {
    const previous = window.__openOrientationCropper;
    previousGlobalHandlerRef.current = previous;
    const handler = (orient?: Orientation) => {
      void openOrientationCropper(orient);
      if (previous && previous !== handler) {
        try {
          previous(orient);
        } catch (error) {
          console.error('[OrientationBridge] Previous orientation handler failed', error);
        }
      }
    };
    window.__openOrientationCropper = handler;
    return () => {
      if (window.__openOrientationCropper === handler) {
        if (previous) {
          window.__openOrientationCropper = previous;
        } else {
          delete window.__openOrientationCropper;
        }
      }
    };
  }, [openOrientationCropper]);

  const requestOrientationChange = useCallback(
    async (orient?: Orientation) => {
      const bridgePromise = Promise.resolve(openOrientationCropper(orient));
      const previous = previousGlobalHandlerRef.current;
      if (previous && previous !== window.__openOrientationCropper) {
        try {
          previous(orient);
        } catch (error) {
          console.error('[OrientationBridge] Previous orientation handler failed', error);
        }
      }
      await bridgePromise;
    },
    [openOrientationCropper]
  );

  const contextValue = useMemo<OrientationBridgeContextValue>(() => {
    const activeOrientation = pendingOrientation ?? orientation;
    return {
      requestOrientationChange,
      cropperOpen,
      pendingOrientation,
      orientationChanging,
      orientationPreviewPending,
      activeOrientation,
    };
  }, [cropperOpen, orientation, orientationChanging, orientationPreviewPending, pendingOrientation, requestOrientationChange]);

  return (
    <OrientationBridgeContext.Provider value={contextValue}>
      {children}
      <Suspense fallback={null}>
        {(cropperOpen || pendingOrientation !== null) && (
          <CropperModal
            open={cropperOpen}
            originalImage={originalImage}
            originalDimensions={originalImageDimensions}
            initialOrientation={pendingOrientation ?? orientation}
            smartCropCache={smartCrops}
            onClose={handleCropperDismiss}
            onComplete={handleCropperComplete}
            onSmartCropReady={(result) => setSmartCropForOrientation(result.orientation, result)}
          />
        )}
      </Suspense>
    </OrientationBridgeContext.Provider>
  );
};

const useOrientationBridge = (): OrientationBridgeContextValue => {
  const context = useContext(OrientationBridgeContext);
  if (!context) {
    throw new Error('useOrientationBridge must be used within an OrientationBridgeProvider');
  }
  return context;
};

export { OrientationBridgeProvider, useOrientationBridge };
