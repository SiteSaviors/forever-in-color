import { memo } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import type { StyleOption } from '@/store/useFounderStore';

type Suggestion = {
  id: string;
  style: StyleOption;
  subtitle: string;
  isPremium: boolean;
  isFallback: boolean;
  allowed: boolean;
  lockedMessage?: string | null;
  requiredTier?: string | null;
};

type ComplementarySuggestionsProps = {
  suggestions: Suggestion[];
  onSelect: (styleId: string, tone?: string | null) => void;
  onRequestUpgrade: (suggestion: Suggestion) => void;
};

const ComplementarySuggestions = ({ suggestions, onSelect, onRequestUpgrade }: ComplementarySuggestionsProps) => {
  if (!suggestions.length) return null;

  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-slate-950/55 px-6 py-8 sm:px-10 sm:py-9">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-white/50">Complete the look</p>
          <h3 className="text-xl font-semibold text-white">Curated styles that harmonize with your preview</h3>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={clsx(
              'relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/60 shadow-founder transition-transform motion-safe:hover:-translate-y-1'
            )}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={suggestion.style.preview}
                alt={`${suggestion.style.name} preview`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {suggestion.isPremium && (
                <span className="absolute top-4 left-4 rounded-full border border-purple-400/40 bg-purple-500/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-purple-200 backdrop-blur">
                  Premium
                </span>
              )}
              {!suggestion.allowed && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur">
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                    <Lock className="h-3.5 w-3.5" />
                    Locked
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-4 px-6 py-5 text-white">
              <div className="space-y-1.5">
                <h4 className="text-lg font-semibold">{suggestion.style.name}</h4>
                <p className="text-sm text-white/70 leading-relaxed">{suggestion.subtitle}</p>
              </div>
              {suggestion.lockedMessage && (
                <p className="text-xs text-white/55">{suggestion.lockedMessage}</p>
              )}
              <div className="mt-auto flex flex-col gap-2">
                {suggestion.allowed ? (
                  <button
                    type="button"
                    onClick={() => onSelect(suggestion.style.id, suggestion.style.tone)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-gradient-cta px-4 py-2 text-sm font-semibold text-white shadow-glow-purple transition hover:shadow-glow-purple"
                  >
                    Try this style
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRequestUpgrade(suggestion)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    {suggestion.requiredTier
                      ? `Unlock with ${suggestion.requiredTier.toUpperCase()}`
                      : 'View upgrade plans'}
                    <Lock className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { Suggestion };
export default memo(ComplementarySuggestions);
