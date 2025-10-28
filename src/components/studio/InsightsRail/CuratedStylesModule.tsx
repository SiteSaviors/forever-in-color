import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import type { EntitlementState, StyleOption } from '@/store/useFounderStore';
import { useHandleStyleSelect } from '@/sections/studio/hooks/useHandleStyleSelect';
import { trackStudioV2CuratedStyleClick } from '@/utils/studioV2Analytics';
import { getComplementaryStyles } from '@/utils/storyLayer/copy';
import { useStyleCatalogActions, useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';

type CuratedStylesModuleProps = {
  currentStyle: StyleOption;
  entitlements: EntitlementState;
  onGatePrompt?: (options: {
    title: string;
    description: string;
    ctaLabel: string;
  }) => void;
};

const CuratedStylesModule = ({ currentStyle, onGatePrompt }: CuratedStylesModuleProps) => {
  const [revealed, setRevealed] = useState(false);
  const { styles } = useStyleCatalogState();
  const { evaluateStyleGate, setShowQuotaModal } = useStyleCatalogActions();

  // Lazy-load complementary styles from registry
  const [curated, setCurated] = useState<Awaited<ReturnType<typeof getComplementaryStyles>> | null>(null);

  useEffect(() => {
    let cancelled = false;

    getComplementaryStyles(currentStyle).then((complementaryData) => {
      if (!cancelled) {
        setCurated(complementaryData);
      }
    }).catch((error) => {
      console.error('[CuratedStylesModule] Failed to load complementary styles:', error);
    });

    return () => {
      cancelled = true;
    };
  }, [currentStyle]);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 40);
    return () => window.clearTimeout(timer);
  }, [currentStyle?.id]);

  const curatedStyles = useMemo(() => {
    if (!curated) return [];
    const ids = [curated.premium, curated.fallback].filter(
      (id): id is string => Boolean(id && id !== currentStyle.id)
    );
    return ids
      .map((id) => styles.find((style) => style?.id === id))
      .filter((style): style is StyleOption => Boolean(style))
      .slice(0, 2);
  }, [curated, currentStyle.id, styles]);

  const handleStyleSelect = useHandleStyleSelect({
    onGateDenied: ({ gate, styleId }) => {
      const position = curatedStyles.findIndex((style) => style.id === styleId);
      trackStudioV2CuratedStyleClick({
        currentStyleId: currentStyle.id,
        clickedStyleId: styleId,
        position: (position >= 0 ? position + 1 : 1) as 1 | 2,
        allowed: false,
        reason: gate.reason ?? gate.requiredTier ?? null,
      });
      if (gate.reason === 'quota_exceeded') {
        setShowQuotaModal(true);
      } else if (gate.message && onGatePrompt) {
        onGatePrompt({
          title: 'Unlock Premium Style',
          description: gate.message,
          ctaLabel: 'View Plans',
        });
      }
    },
  });

  const handleSelect = useCallback(
    (style: StyleOption, index: number) => {
      const gate = evaluateStyleGate(style.id);
      const allowed = gate.allowed;
      trackStudioV2CuratedStyleClick({
        currentStyleId: currentStyle.id,
        clickedStyleId: style.id,
        position: (index + 1) as 1 | 2,
        allowed,
        reason: allowed ? null : gate.reason ?? gate.requiredTier ?? null,
      });
      if (!allowed) {
        if (gate.reason === 'quota_exceeded') {
          setShowQuotaModal(true);
        } else if (gate.message && onGatePrompt) {
          onGatePrompt({
            title: 'Unlock Premium Style',
            description: gate.message,
            ctaLabel: 'View Plans',
          });
        }
        return;
      }
      handleStyleSelect(style.id);
    },
    [currentStyle.id, evaluateStyleGate, handleStyleSelect, onGatePrompt, setShowQuotaModal]
  );

  if (!curatedStyles.length) return null;

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Curated for you</p>
        <h4 className="mt-2 font-display text-[26px] font-semibold text-white">
          Try these gallery pairings
        </h4>
        <p className="mt-2 text-sm text-white/70">
          Swap to a sister style crafted to complement your current preview.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {curatedStyles.map((style, index) => {
          const gate = evaluateStyleGate(style.id);
          const locked = !gate.allowed;
          return (
            <article
              key={style.id}
              className={clsx(
                'relative overflow-hidden rounded-[26px] border border-white/12 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.02] p-4 text-white shadow-[0_28px_80px_rgba(8,14,26,0.45)] transition-all duration-500 ease-out motion-safe:hover:-translate-y-1',
                locked && 'opacity-75',
                revealed
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div className="space-y-3">
                <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={style.preview}
                    alt={style.name}
                    className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                    loading="lazy"
                  />
                  {locked ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur">
                      <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                        Premium
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <p className="text-sm uppercase tracking-[0.32em] text-white/50">
                    {locked ? 'Unlock this look' : 'Curated pairing'}
                  </p>
                  <h5 className="text-lg font-semibold text-white line-clamp-2">{style.name}</h5>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect(style, index)}
                  className={clsx(
                    'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                    locked
                      ? 'border-white/25 text-white/70 hover:bg-white/10'
                      : 'border-white/20 bg-gradient-to-r from-purple-500/70 to-blue-500/70 text-white shadow-glow-purple hover:shadow-glow-purple'
                  )}
                >
                  {locked ? 'Unlock Style' : 'Try this style'}
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
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default memo(CuratedStylesModule);
