import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { useFounderStore } from '@/store/useFounderStore';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { CANVAS_SIZE_OPTIONS, getCanvasSizeOption } from '@/utils/canvasSizes';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import CanvasConfig from '@/components/studio/CanvasConfig';
import { trackOrderStarted } from '@/utils/telemetry';
import { useOrientationBridge } from '@/components/studio/orientation/useOrientationBridge';

type StickyOrderRailProps = {
  mobileRoomPreview?: React.ReactNode;
  canvasConfigExpanded: boolean;
};

const StickyOrderRail = ({
  mobileRoomPreview,
  canvasConfigExpanded,
}: StickyOrderRailProps) => {
  const enhancements = useFounderStore((state) => state.enhancements);
  const toggleEnhancement = useFounderStore((state) => state.toggleEnhancement);
  const setLivingCanvasModalOpen = useFounderStore((state) => state.setLivingCanvasModalOpen);
  const total = useFounderStore((state) => state.computedTotal());
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const selectedSize = useFounderStore((state) => state.selectedCanvasSize);
  const setCanvasSize = useFounderStore((state) => state.setCanvasSize);
  const selectedFrame = useFounderStore((state) => state.selectedFrame);
  const setFrame = useFounderStore((state) => state.setFrame);
  const orientationPreviewPending = useFounderStore((state) => state.orientationPreviewPending);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
  const navigate = useNavigate();
  const { requestOrientationChange, cropperOpen, pendingOrientation, orientationChanging, activeOrientation } =
    useOrientationBridge();

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

  const activeOrientationValue = pendingOrientation ?? activeOrientation;
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

  return (
    <aside className="md:sticky md:top-24 space-y-4">
      {/* Orientation Selector */}
      <Card glass className="space-y-4 border-2 border-white/20 p-5">
        <h3 className="text-base font-bold text-white">Orientation</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['vertical', 'square', 'horizontal'] as const).map((orient) => (
            <button
              key={orient}
              onClick={() => {
                void requestOrientationChange(orient);
              }}
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

    </aside>
  );
};

export default StickyOrderRail;
