import { clsx } from 'clsx';

interface TestimonialCard {
  id: string;
  canvasImageUrl: string;
  quote: string;
  author: string;
  location?: string;
  verified?: boolean;
}

interface CanvasTestimonialGridProps {
  testimonials: TestimonialCard[];
  className?: string;
}

/**
 * Canvas Testimonial Grid Component
 * 2x2 grid of testimonials with canvas images
 *
 * Design: Vertical cards with canvas image at top, quote, and attribution
 * Layout: 2x2 grid optimized for desktop sidebar
 */
export const CanvasTestimonialGrid: React.FC<CanvasTestimonialGridProps> = ({
  testimonials,
  className,
}) => {
  // Show up to 4 testimonials
  const displayTestimonials = testimonials.slice(0, 4);

  return (
    <div className={clsx('grid grid-cols-2 gap-3', className)}>
      {displayTestimonials.map((testimonial) => {
        const initial = testimonial.author.charAt(0).toUpperCase();

        return (
          <div
            key={testimonial.id}
            className={clsx(
              'group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300',
              'hover:border-purple-400/40 hover:bg-white/10 hover:scale-[1.02]'
            )}
          >
            {/* Canvas Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={testimonial.canvasImageUrl}
                alt={`Canvas by ${testimonial.author}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay for better text readability */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/60" />
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              {/* Quote */}
              <p className="text-[11px] leading-relaxed text-white/80 line-clamp-3">
                "{testimonial.quote}"
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-2">
                {/* Small Avatar */}
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/20 text-[10px] font-semibold text-white">
                  {initial}
                </div>

                {/* Author & Verified */}
                <div className="flex-1 flex items-center gap-1.5 text-[10px]">
                  <span className="text-white/60 truncate">
                    {testimonial.author}
                    {testimonial.location && ` · ${testimonial.location}`}
                  </span>
                  {testimonial.verified && (
                    <svg
                      className="h-3 w-3 shrink-0 text-emerald-400/80"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Subtle gradient border effect on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-purple-500/10 via-transparent to-emerald-500/10" />
          </div>
        );
      })}
    </div>
  );
};

export default CanvasTestimonialGrid;
