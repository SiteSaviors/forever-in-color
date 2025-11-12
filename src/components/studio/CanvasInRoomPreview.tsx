import { useState, useEffect, useRef, useMemo } from 'react';
import type { Orientation } from '@/utils/imageUtils';
import type { CanvasSize } from '@/store/founder/storeTypes';
import { getRoomAsset } from './roomAssets';
import { useUploadState } from '@/store/hooks/useUploadStore';
import { useCanvasConfigState } from '@/store/hooks/useCanvasConfigStore';
import { usePreviewState, usePreviewEntry, usePreviewCacheEntry } from '@/store/hooks/usePreviewStore';
import { useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';

export interface CanvasInRoomPreviewProps {
  showDimensions?: boolean;
  className?: string;
  customRoomAssetSrc?: string;
}

const TRANSITIONS = {
  PREVIEW_FADE_OUT: 200,
  PREVIEW_FADE_IN: 300,
  ORIENTATION_MORPH: 400,
  SHIMMER_DURATION: 800,
} as const;

const EASINGS = {
  SMOOTH: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

const SIZE_SCALE_MAP: Record<CanvasSize, number> = {
  '8x10': 0.75,
  '12x16': 0.9,
  '16x20': 1,
  '20x24': 1.15,
};

type ShadowPreset = 'subtle' | 'medium' | 'dramatic';

const ORIENTATION_SHADOW: Record<Orientation, ShadowPreset> = {
  vertical: 'medium',
  horizontal: 'medium',
  square: 'subtle',
};

const SHADOW_LOOKUP: Record<ShadowPreset, string> = {
  subtle: '0 10px 20px rgba(0, 0, 0, 0.08), 0 5px 10px rgba(0, 0, 0, 0.06)',
  medium: '0 18px 36px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
  dramatic: '0 30px 60px rgba(0, 0, 0, 0.25), 0 15px 30px rgba(0, 0, 0, 0.15)',
};

const CanvasInRoomPreview = ({
  showDimensions = false,
  className = '',
  customRoomAssetSrc,
}: CanvasInRoomPreviewProps) => {
  const { orientation, orientationChanging, croppedImage, uploadedImage } = useUploadState();
  const { selectedFrame, selectedCanvasSize: selectedSize } = useCanvasConfigState();
  const { previewStatus } = usePreviewState();
  const { currentStyle } = useStyleCatalogState();
  const previewEntry = usePreviewEntry(currentStyle?.id ?? null);
  const cachedEntry = usePreviewCacheEntry(currentStyle?.id ?? null, orientation);

  const { previewUrl, fallbackStyleImage } = useMemo(() => {
    if (!currentStyle) {
      return { previewUrl: null, fallbackStyleImage: null };
    }

    const directUrl = previewEntry?.data?.previewUrl ?? null;
    const cachedUrl = cachedEntry?.url ?? null;

    return {
      previewUrl: directUrl ?? cachedUrl ?? null,
      fallbackStyleImage: currentStyle.preview ?? null,
    };
  }, [cachedEntry, currentStyle, previewEntry]);

  const roomAsset = useMemo(
    () => getRoomAsset(orientation, selectedFrame),
    [orientation, selectedFrame]
  );

  const canvasScale = useMemo(
    () => SIZE_SCALE_MAP[selectedSize] ?? 1,
    [selectedSize]
  );

  const orientationAspectRatio = useMemo(() => {
    if (orientation === 'vertical') return '3 / 4';
    if (orientation === 'horizontal') return '4 / 3';
    return '1 / 1';
  }, [orientation]);

  // Server returns watermarked image for free users, clean for paid users
  // No client-side watermarking needed - just display what server provides
  const displayImage = previewUrl ?? croppedImage ?? uploadedImage ?? fallbackStyleImage ?? null;

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);

  const previousImageRef = useRef<string | null>(null);
  const previousOrientationRef = useRef<Orientation>(orientation);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setContainerSize((prev) =>
        prev.width !== width || prev.height !== height ? { width, height } : prev
      );
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!displayImage) {
      previousImageRef.current = null;
      return;
    }

    if (previousImageRef.current && displayImage !== previousImageRef.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        previousImageRef.current = displayImage;
      }, TRANSITIONS.PREVIEW_FADE_OUT + TRANSITIONS.PREVIEW_FADE_IN);
      return () => clearTimeout(timer);
    }

    if (!previousImageRef.current) {
      previousImageRef.current = displayImage;
    }
  }, [displayImage]);

  useEffect(() => {
    setImageLoaded(false);
  }, [displayImage]);

  useEffect(() => {
    if (orientation !== previousOrientationRef.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        previousOrientationRef.current = orientation;
      }, TRANSITIONS.ORIENTATION_MORPH);
      return () => clearTimeout(timer);
    }
  }, [orientation]);

  useEffect(() => {
    if (imageLoaded && !isTransitioning && displayImage) {
      setShowShimmer(true);
      const timer = setTimeout(() => setShowShimmer(false), TRANSITIONS.SHIMMER_DURATION);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, isTransitioning, displayImage]);

  const artRectPx = useMemo(() => {
    if (!containerSize.width || !containerSize.height) return null;

    const squareSize = Math.min(containerSize.width, containerSize.height);
    const { artRectPct } = roomAsset;

    const baseWidth = squareSize * artRectPct.width;
    const baseHeight = squareSize * artRectPct.height;

    const scaledWidth = baseWidth * canvasScale;
    const scaledHeight = baseHeight * canvasScale;

    const centerX = squareSize * (artRectPct.left + artRectPct.width / 2);
    const centerY = squareSize * (artRectPct.top + artRectPct.height / 2);

    const left = centerX - scaledWidth / 2;
    const top = centerY - scaledHeight / 2;

    const clampedLeft = Math.min(Math.max(left, 0), squareSize - scaledWidth);
    const clampedTop = Math.min(Math.max(top, 0), squareSize - scaledHeight);

    return {
      left: clampedLeft,
      top: clampedTop,
      width: scaledWidth,
      height: scaledHeight,
    };
  }, [roomAsset, containerSize, canvasScale]);

  const boxShadow = useMemo(
    () => SHADOW_LOOKUP[ORIENTATION_SHADOW[orientation]],
    [orientation]
  );

  const isGenerating = orientationChanging || previewStatus === 'generating';
  const showGeneratingOverlay = Boolean(displayImage && isGenerating);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      ref={containerRef}
      className={`canvas-in-room-preview relative w-full overflow-hidden ${className}`}
      style={{
        aspectRatio: orientationAspectRatio,
        minHeight: '400px',
      }}
    >
      <img
        src={customRoomAssetSrc ?? roomAsset.src}
        alt="Ambient living room background"
        className="absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
      />

      {artRectPx && (
        <div
          className="absolute"
          style={{
            top: artRectPx.top,
            left: artRectPx.left,
            width: artRectPx.width,
            height: artRectPx.height,
            transition: `top ${TRANSITIONS.ORIENTATION_MORPH}ms ${EASINGS.SMOOTH}, left ${TRANSITIONS.ORIENTATION_MORPH}ms ${EASINGS.SMOOTH}, width ${TRANSITIONS.ORIENTATION_MORPH}ms ${EASINGS.SMOOTH}, height ${TRANSITIONS.ORIENTATION_MORPH}ms ${EASINGS.SMOOTH}`,
          }}
        >
          <div className="relative h-full w-full">
            {displayImage ? (
              <div
                className="relative h-full w-full overflow-hidden bg-white"
                style={{
                  boxShadow,
                }}
              >
                <img
                  ref={imageRef}
                  src={displayImage}
                  alt="Canvas preview in room"
                  className={`h-full w-full select-none object-cover transition-opacity ${
                    imageLoaded && !isTransitioning ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    transition: `opacity ${
                      isTransitioning ? TRANSITIONS.PREVIEW_FADE_OUT : TRANSITIONS.PREVIEW_FADE_IN
                    }ms ${EASINGS.SMOOTH}`,
                    transform: 'translateZ(0)',
                    willChange: 'opacity',
                  }}
                  onLoad={handleImageLoad}
                  draggable={false}
                />

                {showShimmer && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: `shimmer ${TRANSITIONS.SHIMMER_DURATION}ms ease-out`,
                    }}
                  />
                )}

                {showGeneratingOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/15 backdrop-blur-[1px]">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                      <div className="h-10 w-10 rounded-full border-4 border-purple-400/30 border-t-purple-400 animate-spin" />
                      <span>Updating preview…</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {showDimensions && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1.5 shadow-md backdrop-blur-sm">
              <span className="text-xs font-semibold tracking-wide text-slate-700">
                {selectedSize.replace('x', '×')}″
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
};

export default CanvasInRoomPreview;
