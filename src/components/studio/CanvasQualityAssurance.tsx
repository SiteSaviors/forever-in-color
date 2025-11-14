import { clsx } from 'clsx';
import { Droplet, Frame, Package, Sparkles, Shield } from 'lucide-react';

interface CanvasQualityAssuranceProps {
  className?: string;
  productionImages?: {
    canvasTexture?: string;
    handStretching?: string;
    backHardware?: string;
  };
}

/**
 * Quality Assurance Section
 * Conversion-optimized content for canvas checkout flow
 *
 * Emotional Journey: Wow factor → Gotta-have-this → Warm fuzzy trust
 * Design: Premium museum-quality aesthetic with emerald trust signals
 */
export const CanvasQualityAssurance: React.FC<CanvasQualityAssuranceProps> = ({
  className,
  productionImages,
}) => {
  const qualityCards = [
    {
      image: productionImages?.canvasTexture,
      icon: Droplet,
      headline: 'Colors That Last a Lifetime',
      body: 'Archival inks that won\'t fade—your memory stays vivid for 100+ years. Museum-grade pigments resist UV damage and environmental wear.',
    },
    {
      image: productionImages?.handStretching,
      icon: Frame,
      headline: 'Museum-Quality Craftsmanship',
      body: 'Hand-stretched on 1.25" pine frames by artisans who\'ve mastered their craft. Every corner is inspected twice—perfection is our standard.',
    },
    {
      image: productionImages?.backHardware,
      icon: Package,
      headline: 'Unbox & Hang in 60 Seconds',
      body: 'Pre-mounted sawtooth hangers, protective packaging, insured delivery. No tools, no hassle—just unwrap and transform your wall.',
    },
  ];

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Section 1: Hero Headline */}
      <div className="pt-4 space-y-5 text-center motion-safe:animate-[fadeIn_400ms_ease-in-out]">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-500/15 to-emerald-500/15 border border-white/15 px-6 py-3">
            <Sparkles className="h-4 w-4 text-emerald-300/80" strokeWidth={2} />
            <span className="text-sm font-medium text-white/80">
              Trusted by 100,000+ creators worldwide
            </span>
          </div>
        </div>
        <h3 className="font-display text-3xl font-semibold leading-tight text-white">
          Gallery-Worthy Quality
          <br />
          <span className="bg-gradient-to-r from-purple-300 via-emerald-300 to-purple-300 bg-clip-text text-transparent">
            Made Just for Your Story
          </span>
        </h3>
        <p className="text-sm leading-relaxed text-white/70">
          Every canvas is handcrafted to museum standards—because your memories deserve to become heirlooms.
        </p>
      </div>

      {/* Section 2: Quality Proof Cards */}
      <div className="space-y-4 motion-safe:animate-[fadeIn_400ms_ease-in-out_100ms]">
        {qualityCards.map((card, index) => {
          const IconComponent = card.icon;
          // Alternate image position: left, right, left
          const imageOnRight = index === 1;

          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-white/12 bg-gradient-to-br from-white/5 via-white/3 to-transparent p-5 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(168,85,247,0.15)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className={clsx(
                'relative flex items-center gap-5',
                imageOnRight && 'flex-row-reverse'
              )}>
                {/* Large Image or Icon Placeholder */}
                {card.image ? (
                  <div className="shrink-0 overflow-hidden rounded-xl border border-white/15 w-32 h-32 shadow-lg">
                    <img
                      src={card.image}
                      alt={card.headline}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/15 border border-white/15 shadow-lg">
                    <IconComponent className="h-12 w-12 text-purple-300/70" strokeWidth={1.5} />
                  </div>
                )}

                {/* Text Content */}
                <div className="flex-1 space-y-2 min-w-0">
                  <h5 className="font-display text-base font-semibold leading-tight text-white">
                    {card.headline}
                  </h5>
                  <p className="text-sm leading-relaxed text-white/70">
                    {card.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* Section 3: Guarantee Showcase */}
      <div className="motion-safe:animate-[fadeIn_400ms_ease-in-out_200ms]">
        {/* Primary Guarantee */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 shadow-[0_0_24px_rgba(52,211,153,0.15)]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/8 via-transparent to-emerald-500/8" />

          <div className="relative space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-emerald-300" strokeWidth={2} />
              <h4 className="font-display text-lg font-semibold text-white">
                100-Day Perfection Guarantee
              </h4>
            </div>
            <p className="text-sm text-emerald-100/80">
              Love it or we remake it, free. No questions asked.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Urgency Footer */}
      <div className="border-t border-dashed border-white/15 pt-4 text-center motion-safe:animate-[fadeIn_400ms_ease-in-out_300ms]">
        <p className="text-[11px] leading-relaxed text-orange-300/70">
          🔥 Only 127 canvas slots available this week—we hand-craft each order to perfection.
        </p>
      </div>
    </div>
  );
};

export default CanvasQualityAssurance;
