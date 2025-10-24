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
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {swatches.map((swatch) => (
          <div
            key={swatch.id}
            className="group relative min-w-[160px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-transform motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40"
            tabIndex={0}
            onMouseEnter={() => onSwatchHover?.(swatch)}
            onFocus={() => onSwatchHover?.(swatch)}
            onTouchStart={() => onSwatchHover?.(swatch)}
          >
            <span
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 shadow-innerBrand"
              style={{ backgroundColor: swatch.hex }}
              aria-label={swatch.label}
            />
            <p className="text-sm font-semibold text-white">{swatch.label}</p>
            <p className="text-xs text-white/60 leading-relaxed">{swatch.descriptor}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(PaletteStrip);
