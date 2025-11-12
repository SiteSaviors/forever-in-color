import { clsx } from 'clsx';
import { Quote } from 'lucide-react';

interface StaticTestimonialProps {
  quote: string;
  author: string;
  location?: string;
  verified?: boolean;
  className?: string;
  canvasImageUrl?: string;
  styleName?: string;
  layout?: 'vertical' | 'horizontal';
  imagePosition?: 'left' | 'right';
}

/**
 * Static Testimonial Component
 * Universal social proof below canvas preview
 *
 * Design: Elegant card with gradient border, avatar, quote, verified badge
 * Animation: Subtle fade-in on mount (respects prefers-reduced-motion)
 */
export const StaticTestimonial: React.FC<StaticTestimonialProps> = ({
  quote,
  author,
  location,
  verified = true,
  className,
  canvasImageUrl,
  styleName,
  layout = 'vertical',
  imagePosition = 'left',
}) => {
  // Get first letter for avatar
  const initial = author.charAt(0).toUpperCase();

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-2xl bg-white/5',
        layout === 'horizontal'
          ? 'border-2 border-white/25 p-5 shadow-[0_0_20px_rgba(168,85,247,0.08)]'
          : 'border border-white/10 p-4',
        'motion-safe:animate-[fadeIn_400ms_ease-in-out]',
        className
      )}
    >
      {/* Enhanced gradient overlay for horizontal layout */}
      <div className={clsx(
        "pointer-events-none absolute inset-0",
        layout === 'horizontal'
          ? "bg-gradient-to-br from-purple-500/8 via-transparent to-emerald-500/6"
          : "bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5"
      )} />

      {/* Subtle accent border glow for horizontal layout */}
      {layout === 'horizontal' && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/10 via-transparent to-emerald-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {layout === 'horizontal' ? (
        /* Horizontal Layout */
        <div
          className={clsx(
            'relative flex items-center gap-4',
            imagePosition === 'right' && 'flex-row-reverse'
          )}
        >
          {/* Canvas Image or Avatar */}
          {canvasImageUrl ? (
            <div className="shrink-0 overflow-hidden rounded-xl border border-white/10 w-40 h-40 sm:w-48 sm:h-48">
              <img
                src={canvasImageUrl}
                alt={`${author}'s canvas`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/30 text-sm font-semibold text-white">
              {initial}
            </div>
          )}

          {/* Quote & Attribution */}
          <div className="flex-1 space-y-3 min-w-0">
            {/* Decorative Quote with Icon */}
            <div className="relative">
              <Quote className="absolute -left-1 -top-1 h-6 w-6 text-purple-400/20" />
              <p className="font-display text-lg leading-relaxed text-white line-clamp-3 pl-5">
                "{quote}"
              </p>
            </div>

            {/* Attribution & Verified Badge */}
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-white/65 truncate font-medium">
                — {author}
                {location && <span className="text-white/45"> · {location}</span>}
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)] shrink-0">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      ) : canvasImageUrl ? (
        /* Vertical Layout with Canvas Image */
        <div className="relative space-y-3">
          {/* Canvas Image */}
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/10">
            <img
              src={canvasImageUrl}
              alt={`${author}'s ${styleName || 'canvas'}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Quote & Attribution */}
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-white/85">
              "{quote}"
            </p>
            {styleName && (
              <p className="text-xs text-purple-300/60">
                loved their {styleName} canvas
              </p>
            )}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/50">
                — {author}
                {location && ` · ${location}`}
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/80">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Vertical Layout with Avatar */
        <div className="relative flex items-start gap-3">
          {/* Avatar with gradient */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/30 text-sm font-semibold text-white">
            {initial}
          </div>

          {/* Quote & Attribution */}
          <div className="flex-1 space-y-2">
            <p className="text-sm leading-relaxed text-white/85">
              "{quote}"
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/50">
                — {author}
                {location && ` · ${location}`}
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/80">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticTestimonial;
