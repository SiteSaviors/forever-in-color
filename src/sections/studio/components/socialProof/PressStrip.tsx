import { memo } from 'react';
import { PRESS_LOGOS } from '@/config/socialProofContent';

type PressStripProps = {
  prefersReducedMotion: boolean;
};

const PressStrip = ({ prefersReducedMotion }: PressStripProps) => {
  if (!PRESS_LOGOS.length) return null;

  return (
    <div
      className="relative w-full overflow-hidden border-y border-white/10 bg-white/[0.02] py-4 backdrop-blur-sm"
      aria-labelledby="social-proof-press"
    >
      <span id="social-proof-press" className="sr-only">
        Featured media outlets
      </span>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-950/95 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-950/95 to-transparent"
        aria-hidden="true"
      />
      <div
        className={`flex items-center gap-12 px-10 text-white/45 ${
          prefersReducedMotion ? '' : 'animate-[press-marquee_24s_linear_infinite]'
        }`}
      >
        {[...PRESS_LOGOS, ...PRESS_LOGOS].map((logo, index) => (
          <span
            key={`${logo.id}-${index}`}
            className="inline-flex items-center gap-3 whitespace-nowrap text-sm uppercase tracking-[0.35em]"
          >
            {logo.logoSrc ? (
              <img
                src={logo.logoSrc}
                alt={logo.alt}
                className="h-5 w-auto opacity-80"
                loading="lazy"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <span className="text-white/50">{logo.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default memo(PressStrip);
