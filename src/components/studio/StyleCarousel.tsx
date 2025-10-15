import { useState } from 'react';
import { clsx } from 'clsx';
import Card from '@/components/ui/Card';
import { useFounderStore } from '@/store/useFounderStore';
import { trackLaunchflowOpened } from '@/utils/launchflowTelemetry';

const StyleCarousel = () => {
  const cards = useFounderStore((state) => state.styleCarouselData);
  const hoveredStyleId = useFounderStore((state) => state.hoveredStyleId);
  const selectedStyleId = useFounderStore((state) => state.selectedStyleId);
  const preselectedStyleId = useFounderStore((state) => state.preselectedStyleId);
  const setHoveredStyle = useFounderStore((state) => state.setHoveredStyle);
  const requestUpload = useFounderStore((state) => state.requestUpload);
  const [tappedCard, setTappedCard] = useState<string | null>(null);

  const showOriginal = (id: string) => {
    if (hoveredStyleId === id) return true;
    if (tappedCard === id) return true;
    return false;
  };

  const handleTryStyle = (cardId: string) => {
    setTappedCard(null);
    trackLaunchflowOpened('style_card');
    requestUpload({ preselectedStyleId: cardId });
  };

  const handleToggleTap = (cardId: string) => {
    setTappedCard((current) => (current === cardId ? null : cardId));
  };

  return (
    <div className="overflow-x-auto pb-4" role="list">
      <div className="flex gap-5 min-w-max pe-4">
      {cards.map((card) => {
        const isSelected = preselectedStyleId === card.id || selectedStyleId === card.id;
        const showOriginalImage = showOriginal(card.id);

        return (
          <Card
            key={card.id}
            role="listitem"
            className={clsx(
              'relative overflow-hidden rounded-3xl border-2 transition-all duration-300 bg-slate-950/50 min-w-[260px] lg:min-w-[280px] w-[260px] lg:w-[280px] flex flex-col',
              isSelected
                ? 'border-purple-400 shadow-glow-purple'
                : 'border-white/15 hover:border-white/35 hover:shadow-xl'
            )}
            onMouseEnter={() => setHoveredStyle(card.id)}
            onMouseLeave={() => {
              setHoveredStyle(null);
              setTappedCard(null);
            }}
          >
            <button
              type="button"
              onClick={() => handleToggleTap(card.id)}
              className="relative block w-full h-56 overflow-hidden"
              aria-label={`Preview ${card.name} style`}
            >
              <img
                src={card.resultImage}
                alt={`${card.name} result`}
                className={clsx(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                  showOriginalImage ? 'opacity-0' : 'opacity-100'
                )}
              />
              <img
                src={card.originalImage}
                alt={`${card.name} original`}
                className={clsx(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                  showOriginalImage ? 'opacity-100' : 'opacity-0'
                )}
              />
              <div className="absolute top-4 left-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm transition-opacity duration-300">
                {showOriginalImage ? 'Original photo' : 'Hover to see original'}
              </div>
            </button>
            <div className="relative z-10 flex flex-col p-6 gap-3 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-white">{card.name}</h3>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200">
                    ✨ Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{card.description}</p>
              <div className="mt-auto space-y-3">
                <button
                  type="button"
                  onClick={() => handleTryStyle(card.id)}
                  className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  {card.ctaLabel}
                </button>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Tap to toggle</p>
              </div>
            </div>
          </Card>
        );
      })}
      </div>
    </div>
  );
};

export default StyleCarousel;
