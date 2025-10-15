import { Check, Play } from 'lucide-react';

type CTADeckProps = {
  onUploadClick: () => void;
  onDemoClick?: () => void;
  frictionReducers?: string[];
  showDemo?: boolean;
  className?: string;
};

const defaultFrictionReducers = [
  'Free preview',
  'No credit card',
  '2,341 canvases this week',
];

const CTADeck = ({
  onUploadClick,
  onDemoClick,
  frictionReducers = defaultFrictionReducers,
  showDemo = false,
  className = '',
}: CTADeckProps) => {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Primary CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl px-4">
        <button
          type="button"
          onClick={onUploadClick}
          className="w-full btn-primary px-8 py-5 md:px-16 md:py-6 text-lg md:text-2xl font-bold shadow-[0_25px_60px_rgba(99,102,241,0.7)] hover:shadow-[0_32px_75px_rgba(99,102,241,0.85)] hover:scale-105 transition-all duration-300 leading-tight"
        >
          <span className="block sm:inline">Upload Your Photo</span>
          <br className="sm:hidden" />
          <span className="block sm:inline sm:ml-1.5">To Create Magic →</span>
        </button>

        {/* Optional Demo CTA */}
        {showDemo && onDemoClick && (
          <button
            type="button"
            onClick={onDemoClick}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/50 transition-all"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Watch 60s demo</span>
          </button>
        )}
      </div>

      {/* Friction Reducers - Horizontal on all screen sizes */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4">
        {frictionReducers.map((text, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 whitespace-nowrap">
            <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/20 flex-shrink-0">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" strokeWidth={3} />
            </div>
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CTADeck;
