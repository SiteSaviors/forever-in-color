import { clsx } from 'clsx';

interface StaticTestimonialProps {
  quote: string;
  author: string;
  location?: string;
  verified?: boolean;
  className?: string;
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
}) => {
  // Get first letter for avatar
  const initial = author.charAt(0).toUpperCase();

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4',
        'motion-safe:animate-[fadeIn_400ms_ease-in-out]',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5" />

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
    </div>
  );
};

export default StaticTestimonial;
