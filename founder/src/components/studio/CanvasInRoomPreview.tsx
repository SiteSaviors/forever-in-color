import { useState, useEffect, useRef, useMemo } from 'react';
import type { Orientation } from '@/utils/imageUtils';
import { useFounderStore } from '@/store/useFounderStore';
import type { CanvasSize, FrameColor } from '@/store/useFounderStore';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CanvasInRoomPreviewProps {
  /**
   * Enable 3D hover effect (desktop only)
   * @default true
   */
  enableHoverEffect?: boolean;

  /**
   * Show canvas dimensions badge
   * @default false
   */
  showDimensions?: boolean;

  /**
   * Optional CSS class name for container
   */
  className?: string;
}

interface CanvasTransform {
  rotateX: string;
  rotateY: string;
}

interface OrientationConfig {
  aspectRatio: string;
  canvasWidth: string; // CSS value (%, px, etc.)
  canvasHeight: string;
  frameStyle: 'thin-black' | 'classic-wood' | 'modern-thin';
  shadowIntensity: 'subtle' | 'medium' | 'dramatic';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TRANSITIONS = {
  PREVIEW_FADE_OUT: 200,
  PREVIEW_FADE_IN: 300,
  ORIENTATION_MORPH: 400,
  SHIMMER_DURATION: 800,
  HOVER_RESPONSE: 300,
  SKELETON_PULSE: 2000,
} as const;

const EASINGS = {
  SMOOTH: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  ELASTIC: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

// Orientation-specific canvas configurations
const ORIENTATION_CONFIGS: Record<Orientation, OrientationConfig> = {
  vertical: {
    aspectRatio: '2/3',
    canvasWidth: '28%',
    canvasHeight: 'auto',
    frameStyle: 'thin-black',
    shadowIntensity: 'medium',
  },
  square: {
    aspectRatio: '1/1',
    canvasWidth: '32%',
    canvasHeight: 'auto',
    frameStyle: 'classic-wood',
    shadowIntensity: 'subtle',
  },
  horizontal: {
    aspectRatio: '3/2',
    canvasWidth: '42%',
    canvasHeight: 'auto',
    frameStyle: 'modern-thin',
    shadowIntensity: 'medium',
  },
};

// Orientation name mapping (code → file names)
const ORIENTATION_MAP: Record<Orientation, string> = {
  vertical: 'portrait',
  square: 'square',
  horizontal: 'horizontal',
};

// Frame type mapping (state → file names)
const FRAME_MAP: Record<FrameColor, string> = {
  black: 'black-framed',
  white: 'white-framed',
  none: 'unframed',
};

// Canvas size scaling (visual cue, not physical accuracy)
const SIZE_SCALE_MAP: Record<CanvasSize, number> = {
  '8x10': 0.75,
  '12x16': 0.90,
  '16x20': 1.00,
  '20x24': 1.15,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CanvasInRoomPreview = ({
  enableHoverEffect = true,
  showDimensions = false,
  className = '',
}: CanvasInRoomPreviewProps) => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ZUSTAND SUBSCRIPTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const orientation = useFounderStore((s) => s.orientation);
  const selectedFrame = useFounderStore((s) => s.selectedFrame);
  const selectedSize = useFounderStore((s) => s.selectedCanvasSize);
  const orientationChanging = useFounderStore((s) => s.orientationChanging);

  // Get current preview URL from selected style
  const previewUrl = useFounderStore((s) => {
    const currentStyle = s.styles.find((style) => style.id === s.selectedStyleId);
    return s.previews[currentStyle?.id ?? '']?.data?.previewUrl ?? null;
  });

  const isGenerating = orientationChanging;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoverActive, setHoverActive] = useState(false);
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>({
    rotateX: '0deg',
    rotateY: '0deg',
  });
  const [showShimmer, setShowShimmer] = useState(false);

  const previousPreviewUrlRef = useRef<string | null>(null);
  const previousOrientationRef = useRef<Orientation>(orientation);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPUTED VALUES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const config = useMemo(() => ORIENTATION_CONFIGS[orientation], [orientation]);

  const roomBackgroundUrl = useMemo(() => {
    const orientName = ORIENTATION_MAP[orientation];
    const frameName = FRAME_MAP[selectedFrame];
    return `/room-backgrounds/${orientName}-${frameName}.jpg`;
  }, [orientation, selectedFrame]);

  const canvasScale = useMemo(() => SIZE_SCALE_MAP[selectedSize], [selectedSize]);

  const showLoadingState = isGenerating || !previewUrl;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EFFECTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Handle preview URL changes with crossfade
  useEffect(() => {
    if (previewUrl && previewUrl !== previousPreviewUrlRef.current) {
      if (previousPreviewUrlRef.current) {
        // Trigger crossfade transition
        setIsTransitioning(true);
        setImageLoaded(false);

        // Reset transition flag after animation completes
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, TRANSITIONS.PREVIEW_FADE_OUT + TRANSITIONS.PREVIEW_FADE_IN);

        return () => clearTimeout(timer);
      }
      previousPreviewUrlRef.current = previewUrl;
    }
  }, [previewUrl]);

  // Handle orientation changes with morph animation
  useEffect(() => {
    if (orientation !== previousOrientationRef.current) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITIONS.ORIENTATION_MORPH);

      previousOrientationRef.current = orientation;
      return () => clearTimeout(timer);
    }
  }, [orientation]);

  // Trigger shimmer effect when image loads
  useEffect(() => {
    if (imageLoaded && !isTransitioning && previewUrl) {
      setShowShimmer(true);
      const timer = setTimeout(() => {
        setShowShimmer(false);
      }, TRANSITIONS.SHIMMER_DURATION);

      return () => clearTimeout(timer);
    }
  }, [imageLoaded, isTransitioning, previewUrl]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableHoverEffect || window.innerWidth < BREAKPOINTS.tablet) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Max rotation: 3 degrees
    const rotateY = x * 3;
    const rotateX = -y * 3;

    setCanvasTransform({
      rotateX: `${rotateX}deg`,
      rotateY: `${rotateY}deg`,
    });
  };

  const handleMouseEnter = () => {
    if (enableHoverEffect && window.innerWidth >= BREAKPOINTS.tablet) {
      setHoverActive(true);
    }
  };

  const handleMouseLeave = () => {
    setHoverActive(false);
    setCanvasTransform({ rotateX: '0deg', rotateY: '0deg' });
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <div
      ref={containerRef}
      className={`canvas-in-room-preview relative w-full overflow-hidden ${className}`}
      style={{
        aspectRatio: '16/9',
        minHeight: '400px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Room Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${roomBackgroundUrl})`,
          backgroundColor: '#2a2520', // Fallback while loading
        }}
      />

      {/* Canvas Frame Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`canvas-frame-container relative transition-all ${
            isTransitioning ? 'duration-400' : 'duration-300'
          }`}
          style={{
            width: config.canvasWidth,
            aspectRatio: config.aspectRatio,
            transform: `scale(${canvasScale})`,
            transition: `all ${TRANSITIONS.ORIENTATION_MORPH}ms ${EASINGS.SMOOTH}, transform 350ms ${EASINGS.SPRING}`,
          }}
        >
          {/* Canvas Frame with Shadow */}
          <div
            className={`canvas-frame relative w-full h-full rounded-sm bg-white transition-all ${
              hoverActive ? 'scale-102' : 'scale-100'
            }`}
            style={{
              padding: config.frameStyle === 'classic-wood' ? '12px' : '8px',
              backgroundColor: config.frameStyle === 'thin-black' ? '#1a1a1a' : '#4a3f35',
              boxShadow:
                config.shadowIntensity === 'dramatic'
                  ? '0 30px 60px rgba(0, 0, 0, 0.25), 0 15px 30px rgba(0, 0, 0, 0.15)'
                  : config.shadowIntensity === 'medium'
                  ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)'
                  : '0 10px 20px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.08)',
              transform: `perspective(1000px) rotateX(${canvasTransform.rotateX}) rotateY(${canvasTransform.rotateY})`,
              transition: `transform ${TRANSITIONS.HOVER_RESPONSE}ms ${EASINGS.SPRING}, box-shadow ${TRANSITIONS.HOVER_RESPONSE}ms ${EASINGS.SMOOTH}, scale 0.3s ${EASINGS.SPRING}`,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Inner Canvas Content */}
            <div className="relative w-full h-full overflow-hidden bg-white rounded-sm">
              {/* Loading Skeleton */}
              {showLoadingState && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse-slow">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    <p className="text-sm font-medium text-slate-600">
                      {isGenerating ? 'Creating your masterpiece...' : 'Loading preview...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Preview Image */}
              {previewUrl && (
                <div className="relative w-full h-full">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Canvas preview in room"
                    className={`w-full h-full object-cover transition-opacity ${
                      imageLoaded && !isTransitioning
                        ? 'opacity-100'
                        : 'opacity-0'
                    }`}
                    style={{
                      transition: `opacity ${
                        isTransitioning ? TRANSITIONS.PREVIEW_FADE_IN : TRANSITIONS.PREVIEW_FADE_OUT
                      }ms ${EASINGS.SMOOTH}`,
                      transform: 'translateZ(0)',
                      willChange: 'opacity',
                    }}
                    onLoad={handleImageLoad}
                  />

                  {/* Shimmer Reveal Effect */}
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
                </div>
              )}
            </div>

            {/* Frame Inner Shadow (depth effect) */}
            <div
              className="absolute inset-0 pointer-events-none rounded-sm"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            />
          </div>

          {/* Canvas Dimensions Badge */}
          {showDimensions && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md">
              <span className="text-xs font-semibold text-slate-700 tracking-wide">
                {selectedSize.replace('x', '×')}″
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow ${TRANSITIONS.SKELETON_PULSE}ms ease-in-out infinite;
        }

        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default CanvasInRoomPreview;
