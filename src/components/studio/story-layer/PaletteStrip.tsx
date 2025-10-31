import { memo } from 'react';
import type { PaletteSwatch } from '@/utils/storyLayer/copy';

type PaletteStripProps = {
  swatches: PaletteSwatch[];
  onSwatchHover?: (swatch: PaletteSwatch) => void;
};

const PaletteStrip = ({ swatches, onSwatchHover }: PaletteStripProps) => {
  if (!swatches.length) return null;

  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-slate-950/60 px-6 py-7 sm:px-10 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-white/50">Palette Highlights</p>
          <p className="mt-1 text-sm text-white/70">Signature hues that make this style pop</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {swatches.map((swatch, index) => (
          <div
            key={`${swatch.id}-${index}`}
            className="group relative rounded-xl border border-white/10 bg-white/[0.08] px-3.5 py-4 transition-transform motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40"
            tabIndex={0}
            onMouseEnter={() => onSwatchHover?.(swatch)}
            onFocus={() => onSwatchHover?.(swatch)}
            onTouchStart={() => onSwatchHover?.(swatch)}
          >
            <span
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 shadow-innerBrand"
              style={{ backgroundColor: swatch.hex }}
              aria-label={swatch.label}
            />
            <p className="text-sm font-semibold text-white leading-snug">{swatch.label}</p>
            <p className="text-xs text-white/60 leading-relaxed">{swatch.descriptor}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(PaletteStrip);
