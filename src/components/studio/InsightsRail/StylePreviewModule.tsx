import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import type { StyleOption } from '@/store/founder/storeTypes';
import type { Orientation } from '@/utils/imageUtils';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { usePreviewEntry, usePreviewCacheEntry } from '@/store/hooks/usePreviewStore';

type StylePreviewModuleProps = {
  highlightedStyle: StyleOption | null;
  stage: 'pre-upload' | 'post-upload';
  orientation: Orientation;
};

const StylePreviewModule = ({ highlightedStyle, stage, orientation }: StylePreviewModuleProps) => {
  const styleId = highlightedStyle?.id ?? null;
  const previewEntry = usePreviewEntry(styleId);
  const cachedEntry = usePreviewCacheEntry(styleId, orientation);

  const previewPayload = useMemo(() => {
    if (!highlightedStyle || stage !== 'post-upload') {
      return null;
    }

    const cachedUrl = cachedEntry?.url ?? null;
    const url = previewEntry?.data?.previewUrl ?? cachedUrl;

    if (!url) {
      return null;
    }

    return {
      url,
      generatedOrientation: previewEntry?.orientation ?? (cachedUrl ? orientation : null),
    };
  }, [cachedEntry, highlightedStyle, orientation, previewEntry, stage]);

  const baseOrientation = previewPayload?.generatedOrientation ?? orientation;
  const baseOrientationMeta = ORIENTATION_PRESETS[baseOrientation];
  const selectedOrientationMeta = ORIENTATION_PRESETS[orientation];
  const orientationMismatch =
    previewPayload?.generatedOrientation &&
    previewPayload.generatedOrientation !== orientation;
  const mismatchLabel = previewPayload?.generatedOrientation
    ? ORIENTATION_PRESETS[previewPayload.generatedOrientation].label
    : null;

  if (!previewPayload || !baseOrientationMeta || !selectedOrientationMeta) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/45">
          Latest Preview
        </p>
        <h3 className="font-display text-[1.4rem] font-semibold tracking-tight text-white">
          {highlightedStyle?.name}
        </h3>
        <p className="text-sm text-white/60">
          Freshly generated Wondertone preview — matched to your current settings.
        </p>
      </header>

      <div
        className={clsx(
          'relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent',
          'shadow-[0_28px_90px_rgba(8,14,32,0.55)]'
        )}
        style={{
          aspectRatio: baseOrientationMeta.ratio,
        }}
      >
        <img
          src={previewPayload.url}
          alt={highlightedStyle?.name ?? 'Generated canvas preview'}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
          onContextMenu={(event) => event.preventDefault()}
          onDragStart={(event) => event.preventDefault()}
        />

        <span className="absolute top-4 left-4 rounded-full bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur">
          {baseOrientationMeta.label}
        </span>

        {orientationMismatch && mismatchLabel && (
          <div className="absolute bottom-4 left-1/2 w-[90%] max-w-xs -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/75 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/65 backdrop-blur">
            Preview uses {mismatchLabel} crop · Current canvas {selectedOrientationMeta.label}
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(StylePreviewModule);
