import { memo, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { STUDIO_V2_COPY } from '@/config/studioV2Copy';
import { trackStudioV2CanvasCtaClick } from '@/utils/studioV2Analytics';
import type { Orientation } from '@/utils/imageUtils';

type SecondaryCanvasCtaProps = {
  styleId: string;
  orientation: Orientation;
  disabled: boolean;
  onRequestCanvas: (source: 'center' | 'rail') => void;
};

const SecondaryCanvasCta = ({
  styleId,
  orientation,
  disabled,
  onRequestCanvas,
}: SecondaryCanvasCtaProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(timer);
  }, [styleId]);

  const handleClick = () => {
    if (disabled) return;
    trackStudioV2CanvasCtaClick({
      styleId,
      orientation,
      source: 'rail',
    });
    onRequestCanvas('rail');
  };

  return (
    <section
      className={clsx(
        'rounded-[28px] border border-white/12 bg-white/[0.02] p-6 text-white shadow-[0_24px_70px_rgba(8,15,28,0.4)] transition-all duration-500 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-white/45">
            Canvas Showcase
          </p>
          <h4 className="mt-2 font-display text-2xl font-semibold">
            Create Canvas Print
          </h4>
          <p className="text-sm text-white/70">{STUDIO_V2_COPY.secondaryCta.subtext}</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          title={disabled ? 'Upload & crop a photo first' : 'Open canvas configurator'}
          className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{STUDIO_V2_COPY.secondaryCta.label}</span>
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 5L12 10L7 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default memo(SecondaryCanvasCta);
