import { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import type { Orientation } from '@/utils/imageUtils';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { useUploadState } from '@/store/hooks/useUploadStore';

type OriginalComparisonModuleProps = {
  stage: 'pre-upload' | 'post-upload';
  orientation: Orientation;
  styledPreviewUrl?: string | null;
  prefersReducedMotion?: boolean;
};

const OriginalComparisonModule = ({
  stage,
  orientation,
  styledPreviewUrl,
  prefersReducedMotion = false,
}: OriginalComparisonModuleProps) => {
  const { croppedImage } = useUploadState();
  const [originalWeight, setOriginalWeight] = useState(1); // 1 → show original, 0 → show styled
  const [isAnimating, setIsAnimating] = useState(false);

  const orientationMeta = useMemo(() => {
    return ORIENTATION_PRESETS[orientation];
  }, [orientation]);

  const handleToggle = useCallback(() => {
    setOriginalWeight((prev) => (prev > 0.9 ? 0 : 1));
  }, []);

  const handlePointerEnter = () => {
    if (!prefersReducedMotion && styledPreviewUrl) {
      setOriginalWeight(0); // Hide original, show styled
    }
  };

  const handlePointerLeave = () => {
    if (!prefersReducedMotion && styledPreviewUrl) {
      setOriginalWeight(1); // Show original, hide styled
    }
  };

  const originalWidthPercent = Math.min(100, Math.max(0, originalWeight * 100));
  const toggleLabel = originalWidthPercent > 12 ? 'Show Styled' : 'Show Original';

  useEffect(() => {
    if (!prefersReducedMotion && styledPreviewUrl) {
      setIsAnimating(true);
      const id = window.setTimeout(() => setIsAnimating(false), 600);
      return () => window.clearTimeout(id);
    }
    setIsAnimating(false);
  }, [originalWeight, prefersReducedMotion, styledPreviewUrl]);

  // Only show in post-upload stage when we have a cropped image
  if (stage !== 'post-upload' || !croppedImage || !orientationMeta) {
    return null;
  }

  // If no styled preview available, show static original image
  const hasComparison = Boolean(styledPreviewUrl);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/45">
          {hasComparison ? 'Before & After' : 'Your Original Photo'}
        </p>
        <h3 className="font-display text-[1.4rem] font-semibold tracking-tight text-white">
          {hasComparison ? 'Interactive Comparison' : 'Before AI Transformation'}
        </h3>
        <p className="text-sm text-white/60">
          {hasComparison
            ? 'Hover to reveal your styled preview. Compare instantly.'
            : 'Your styled preview will appear here once generated.'}
        </p>
      </header>

      <div
        className={clsx(
          'relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent',
          'shadow-[0_28px_90px_rgba(8,14,32,0.55)]'
        )}
        style={{
          aspectRatio: orientationMeta.ratio,
        }}
        onMouseEnter={hasComparison ? handlePointerEnter : undefined}
        onMouseLeave={hasComparison ? handlePointerLeave : undefined}
        onFocus={hasComparison ? handlePointerEnter : undefined}
        onBlur={hasComparison ? handlePointerLeave : undefined}
      >
        {/* Styled preview (base layer) */}
        {hasComparison && styledPreviewUrl && (
          <img
            src={styledPreviewUrl}
            alt="AI-styled preview"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
          />
        )}

        {/* Original image overlay */}
        <div
          className={clsx(
            'absolute inset-y-0 left-0 overflow-hidden',
            hasComparison && 'border-r border-white/15 shadow-[8px_0_20px_rgba(0,0,0,0.35)] transition-[width] duration-500'
          )}
          style={{
            width: hasComparison ? (originalWidthPercent === 0 ? '0%' : `${originalWidthPercent}%`) : '100%',
            borderRightWidth: hasComparison && originalWidthPercent >= 99.9 ? 0 : undefined,
            position: hasComparison ? 'absolute' : 'relative',
          }}
        >
          <img
            src={croppedImage}
            alt={hasComparison && originalWidthPercent > 0 ? 'Your original photo before transformation' : 'Your original photo'}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
          />
          {hasComparison && originalWidthPercent > 0 && !prefersReducedMotion && (
            <div
              className={`absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-purple-200/80 via-purple-200/20 to-transparent blur-lg transition-opacity duration-500 ${
                isAnimating ? 'opacity-70' : 'opacity-0'
              }`}
            />
          )}
        </div>

        {/* Orientation badge */}
        <span className="absolute top-4 left-4 rounded-full bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur">
          {orientationMeta.label}
        </span>

        {/* Toggle button (only show if we have comparison) */}
        {hasComparison && (
          <button
            type="button"
            onClick={handleToggle}
            className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
          >
            {toggleLabel}
          </button>
        )}
      </div>
    </section>
  );
};

export default memo(OriginalComparisonModule);
