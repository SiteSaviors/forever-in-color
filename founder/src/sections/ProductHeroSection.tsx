import { useMemo } from 'react';
import Section from '@/components/layout/Section';
import StyleCarousel from '@/components/studio/StyleCarousel';
import { useFounderStore } from '@/store/useFounderStore';

const ProductHeroSection = () => {
  const requestUpload = useFounderStore((state) => state.requestUpload);
  const styles = useFounderStore((state) => state.styles);
  const preselectedStyleId = useFounderStore((state) => state.preselectedStyleId);

  const preselectedStyleName = useMemo(() => {
    if (!preselectedStyleId) return null;
    const matching = styles.find((style) => style.id === preselectedStyleId);
    if (matching) return matching.name;

    return preselectedStyleId
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, [preselectedStyleId, styles]);

  return (
    <section
      className="relative overflow-hidden bg-gradient-hero"
      data-founder-hero
      id="founder-hero"
    >
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/nice-snow.png')]" />
      <Section className="relative pt-44 pb-24">
        <div className="mx-auto max-w-4xl text-center text-white space-y-10">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight drop-shadow-2xl">
              Transform Your Memories Into Museum-Quality Art
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
              AI-powered canvas art that brings your photos to life.
            </p>
          </div>
          {preselectedStyleName && (
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 border border-purple-400/30 px-5 py-2 text-sm font-semibold text-purple-200">
              ✨ {preselectedStyleName} selected
            </div>
          )}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => requestUpload()}
              className="btn-primary whitespace-nowrap px-12 sm:px-16 md:px-24 py-6 text-xl sm:text-2xl md:text-3xl tracking-wide shadow-[0_25px_60px_rgba(99,102,241,0.65)] hover:shadow-[0_32px_75px_rgba(99,102,241,0.75)]"
            >
              Upload Your Photo to Start the Magic →
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-white/70 uppercase tracking-[0.3em]">
            <span className="hidden sm:block h-px w-16 bg-white/30" aria-hidden="true" />
            <span>Or Browse Styles First</span>
            <span className="hidden sm:block h-px w-16 bg-white/30" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-16 space-y-6" data-founder-anchor="styles">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-center lg:text-left">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">Curated Styles</p>
              <h2 className="text-2xl font-semibold text-white mt-2">Hover to see the original • Click to try the style</h2>
            </div>
            <span className="text-sm text-white/60">First preview prioritizes your selected style.</span>
          </div>
          <StyleCarousel />
        </div>
      </Section>
    </section>
  );
};

export default ProductHeroSection;
