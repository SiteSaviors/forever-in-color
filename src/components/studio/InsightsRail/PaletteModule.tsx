import { memo, useCallback, useMemo } from 'react';
import PaletteStrip from '@/components/studio/story-layer/PaletteStrip';
import type { PaletteSwatch } from '@/utils/storyLayer/copy';
import { expandPaletteSwatches } from '@/utils/studioV2/palette';
import { trackStudioV2StoryPaletteHover } from '@/utils/studioV2Analytics';

type PaletteModuleProps = {
  styleId: string;
  swatches: PaletteSwatch[];
};

const PaletteModule = ({ styleId, swatches }: PaletteModuleProps) => {
  const hasSwatches = swatches.length > 0;
  const palette = useMemo(() => expandPaletteSwatches(swatches, 6), [swatches]);

  const handleHover = useCallback(
    (swatch: PaletteSwatch) => {
      trackStudioV2StoryPaletteHover({
        styleId,
        swatchHex: swatch.hex,
      });
    },
    [styleId]
  );

  if (!hasSwatches) {
    return (
      <section className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-6 text-sm text-white/65">
        Palette insights are coming soon for this style. Our curators are polishing every hue.
      </section>
    );
  }

  return <PaletteStrip swatches={palette} onSwatchHover={handleHover} />;
};

export default memo(PaletteModule);
