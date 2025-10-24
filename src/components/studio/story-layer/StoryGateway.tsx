import { memo } from 'react';

type StoryGatewayProps = {
  styleName: string;
};

const StoryGateway = ({ styleName }: StoryGatewayProps) => {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-preview-bg px-6 py-8 sm:px-10 sm:py-12 text-center text-white">
      <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.35),transparent_65%)] opacity-60 blur-3xl motion-safe:animate-pulse-slow" />
      <div className="relative space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/60">Wondertone Story</p>
        <h2 className="text-2xl sm:text-3xl md:text-[2.35rem] font-display leading-tight">
          {`Why ${styleName} feels special`}
        </h2>
        <p className="text-sm text-white/70 md:text-base max-w-2xl mx-auto leading-relaxed">
          Follow the narrative, palette, and curator tips crafted for your latest studio preview.
        </p>
      </div>
    </div>
  );
};

export default memo(StoryGateway);
