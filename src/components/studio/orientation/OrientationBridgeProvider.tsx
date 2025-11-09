import {
  createContext,
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
import { useUploadActions, useUploadState } from '@/store/hooks/useUploadStore';
import { usePreviewActions, usePreviewLockState, usePreviewState } from '@/store/hooks/usePreviewStore';
import { useCanvasConfigActions, useCanvasConfigState } from '@/store/hooks/useCanvasConfigStore';
import { useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';
import CropperModal from '@/components/launchpad/cropper/CropperModal';

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

  const {
    originalImage,
    originalImageDimensions,
    smartCrops,
    croppedImage,
    orientation,
    orientationChanging,
  } = useUploadState();
  const {
    setOrientation,
    setOrientationTip,
    setOrientationChanging,
    setSmartCropForOrientation,
    setCroppedImage,
    markCropReady,
  } = useUploadActions();
  const { orientationPreviewPending } = usePreviewState();
  const {
    startStylePreview,
    setPreviewState,
    setOrientationPreviewPending,
    hasCachedPreview,
  } = usePreviewActions();
  const { selectedCanvasSize: selectedSize } = useCanvasConfigState();
  const { setCanvasSize } = useCanvasConfigActions();
  const { currentStyle } = useStyleCatalogState();
  const { isLocked: previewLocked } = usePreviewLockState();

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

      const shouldRegeneratePreview =
        Boolean(currentStyle) &&
        currentStyle.id !== 'original-image' &&
        !hasCachedPreview(currentStyle.id, targetOrientation);

      if (shouldRegeneratePreview && currentStyle) {
        if (previewLocked) {
          setOrientationPreviewPending(false);
        } else {
          try {
            setOrientationPreviewPending(true);
            await startStylePreview(currentStyle, { force: true, orientationOverride: targetOrientation });
          } catch (error) {
            console.error('[OrientationBridge] Failed to regenerate preview for orientation change', error);
          } finally {
            setOrientationPreviewPending(false);
          }
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
      hasCachedPreview,
      previewLocked,
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
