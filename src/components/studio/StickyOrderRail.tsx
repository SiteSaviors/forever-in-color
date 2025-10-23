import { lazy, Suspense, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { useFounderStore } from '@/store/useFounderStore';
import { cacheSmartCropResult, generateSmartCrop, ORIENTATION_PRESETS, SmartCropResult } from '@/utils/smartCrop';
import type { Orientation } from '@/utils/imageUtils';
import { CANVAS_SIZE_OPTIONS, getCanvasSizeOption, getDefaultSizeForOrientation } from '@/utils/canvasSizes';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import ActionRow from '@/components/studio/ActionRow';
import CanvasConfig from '@/components/studio/CanvasConfig';
import { trackOrderStarted } from '@/utils/telemetry';

const CropperModal = lazy(() => import('@/components/launchpad/cropper/CropperModal'));

type StickyOrderRailProps = {
  mobileRoomPreview?: React.ReactNode;
  onDownloadClick: () => void;
  downloadingHD: boolean;
  isPremiumUser: boolean;
};

const StickyOrderRail = ({ mobileRoomPreview, onDownloadClick, downloadingHD, isPremiumUser }: StickyOrderRailProps) => {
  const inFlightCropsRef = useRef<Map<Orientation, Promise<SmartCropResult>>>(new Map());
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingOrientation, setPendingOrientation] = useState<Orientation | null>(null);
  const [canvasConfigExpanded, setCanvasConfigExpanded] = useState(true);
  const canvasToggleRef = useRef<HTMLButtonElement>(null);
  const enhancements = useFounderStore((state) => state.enhancements);
  const toggleEnhancement = useFounderStore((state) => state.toggleEnhancement);
  const setLivingCanvasModalOpen = useFounderStore((state) => state.setLivingCanvasModalOpen);
  const total = useFounderStore((state) => state.computedTotal());
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const orientation = useFounderStore((state) => state.orientation);
  const setOrientation = useFounderStore((state) => state.setOrientation);
  const startStylePreview = useFounderStore((state) => state.startStylePreview);
  const setPreviewState = useFounderStore((state) => state.setPreviewState);
  const originalImage = useFounderStore((state) => state.originalImage);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const originalImageDimensions = useFounderStore((state) => state.originalImageDimensions);
  const smartCrops = useFounderStore((state) => state.smartCrops);
  const setSmartCropForOrientation = useFounderStore((state) => state.setSmartCropForOrientation);
  const setCroppedImage = useFounderStore((state) => state.setCroppedImage);
  const markCropReady = useFounderStore((state) => state.markCropReady);
  const setOrientationTip = useFounderStore((state) => state.setOrientationTip);
  const orientationChanging = useFounderStore((state) => state.orientationChanging);
  const setOrientationChanging = useFounderStore((state) => state.setOrientationChanging);
  const selectedSize = useFounderStore((state) => state.selectedCanvasSize);
  const setCanvasSize = useFounderStore((state) => state.setCanvasSize);
  const selectedFrame = useFounderStore((state) => state.selectedFrame);
  const setFrame = useFounderStore((state) => state.setFrame);
  const orientationPreviewPending = useFounderStore((state) => state.orientationPreviewPending);
  const setOrientationPreviewPending = useFounderStore((state) => state.setOrientationPreviewPending);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
  const navigate = useNavigate();

  const floatingFrame = enhancements.find((e) => e.id === 'floating-frame');
  const livingCanvas = enhancements.find((e) => e.id === 'living-canvas');

  const enabledEnhancements = enhancements.filter((item) => item.enabled);

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleLivingCanvasToggle = () => {
    if (!livingCanvas?.enabled) {
      // Show demo modal before enabling
      setLivingCanvasModalOpen(true);
    } else {
      toggleEnhancement('living-canvas');
    }
  };

  const ensureSmartCropForOrientation = async (orient: Orientation): Promise<SmartCropResult | null> => {
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
  };

  const handleOrientationSelect = async (orient: Orientation) => {
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
  };

  const handleCropperDismiss = () => {
    setCropperOpen(false);
    setPendingOrientation(null);
    setOrientationPreviewPending(false);
    setOrientationChanging(false);
  };

  const handleCropperComplete = async (result: SmartCropResult) => {
    const targetOrientation = result.orientation;

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
        console.error('[StickyOrderRail] Failed to regenerate preview for orientation change', error);
      } finally {
        setOrientationPreviewPending(false);
      }
    } else {
      setOrientationPreviewPending(false);
      if (hasCachedPreview) {
        console.log('[StickyOrderRail] Reusing cached preview for orientation change.');
      }
    }

    setOrientationChanging(false);
  };

  const activeOrientationValue = pendingOrientation ?? orientation;
  const sizeOptionsForOrientation = CANVAS_SIZE_OPTIONS[activeOrientationValue];
  const selectedSizeOption = getCanvasSizeOption(selectedSize);
  const hasFinalizedPhoto = Boolean(croppedImage);
  const checkoutDisabled =
    !currentStyle ||
    !hasFinalizedPhoto ||
    !selectedSizeOption ||
    orientationPreviewPending ||
    orientationChanging ||
    false;

  const downloadDisabled =
    !currentStyle ||
    !hasFinalizedPhoto ||
    orientationPreviewPending ||
    orientationChanging;

  const canvasButtonDisabled = orientationChanging || cropperOpen;
  const canvasLocked = !hasFinalizedPhoto || orientationPreviewPending;

  const handleCheckout = async () => {
    if (checkoutDisabled) return;

    if (!currentStyle || !selectedSizeOption || !croppedImage) {
      setCheckoutError('Select your style and finalize your photo before checking out.');
      return;
    }

    // Track order started
    const userTier = useFounderStore.getState().entitlements?.tier ?? 'free';
    trackOrderStarted(userTier, total, enabledEnhancements.length > 0);

    setCheckoutError(null);
    resetCheckout();
    navigate('/checkout');
  };

  const handleCanvasToggle = () => {
    setCanvasConfigExpanded((prev) => {
      const next = !prev;
      if (prev && canvasToggleRef.current) {
        window.requestAnimationFrame(() => canvasToggleRef.current?.focus({ preventScroll: true }));
      }
      return next;
    });
  };

  return (
    <aside className="md:sticky md:top-24 space-y-4">
      {/* Orientation Selector */}
      <Card glass className="space-y-4 border-2 border-white/20 p-5">
        <h3 className="text-base font-bold text-white">Orientation</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['vertical', 'square', 'horizontal'] as const).map((orient) => (
            <button
              key={orient}
              onClick={() => void handleOrientationSelect(orient)}
              disabled={orientationChanging || cropperOpen}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeOrientationValue === orient
                  ? 'bg-purple-500 text-white shadow-glow-soft'
                  : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
              }`}
            >
              {orientationChanging && pendingOrientation === orient
                ? 'Loading…'
                : cropperOpen && pendingOrientation === orient
                  ? 'Adjusting…'
                  : ORIENTATION_PRESETS[orient].label}
            </button>
          ))}
        </div>
      </Card>

      {/* Action Row - Download Image & Create Canvas CTAs */}
      <ActionRow
        onDownloadClick={onDownloadClick}
        onCanvasClick={handleCanvasToggle}
        downloadingHD={downloadingHD}
        isPremiumUser={isPremiumUser}
        canvasConfigExpanded={canvasConfigExpanded}
        downloadDisabled={downloadDisabled}
        canvasButtonDisabled={canvasButtonDisabled}
        canvasLocked={canvasLocked}
        canvasButtonRef={canvasToggleRef}
      />

      {/* Canvas Config - Collapsible */}
      <CanvasConfig
        isExpanded={canvasConfigExpanded}
        isLocked={canvasLocked}
        orientation={activeOrientationValue}
        sizeOptions={sizeOptionsForOrientation}
        selectedSize={selectedSize}
        onSizeChange={setCanvasSize}
        floatingFrame={floatingFrame}
        livingCanvas={livingCanvas}
        selectedFrame={selectedFrame}
        onToggleFloatingFrame={() => {
          toggleEnhancement('floating-frame');
          if (!floatingFrame?.enabled) {
            setFrame('black');
          } else {
            setFrame('none');
          }
        }}
        onToggleLivingCanvas={handleLivingCanvasToggle}
        onFrameChange={setFrame}
        onLivingCanvasInfoClick={() => setLivingCanvasModalOpen(true)}
        currentStyleName={currentStyle?.name}
        selectedSizeLabel={selectedSizeOption?.label}
        selectedSizePrice={selectedSizeOption?.price ?? null}
        enabledEnhancements={enabledEnhancements}
        total={total}
        checkoutDisabled={checkoutDisabled}
        checkoutError={checkoutError}
        onCheckout={handleCheckout}
        mobileRoomPreview={mobileRoomPreview}
      />

      {/* Cropper Modal */}
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
    </aside>
  );
};

export default StickyOrderRail;
