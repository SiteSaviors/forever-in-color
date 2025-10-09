import { clsx } from 'clsx';

const STATUS_ORDER = ['animating', 'generating', 'polling', 'watermarking', 'ready', 'error'] as const;

type StatusKey = typeof STATUS_ORDER[number];

type StatusInfo = {
  label: string;
  sublabel?: string;
};

const STATUS_COPY: Record<StatusKey, StatusInfo> = {
  animating: {
    label: 'Summoning the Wondertone studio…',
    sublabel: 'Preparing brushes, pigments, and inspiration',
  },
  generating: {
    label: 'Sketching base strokes…',
    sublabel: 'AI is translating your photo into the chosen style',
  },
  polling: {
    label: 'Layering textures…',
    sublabel: 'Fine-tuning lighting, palette, and signature flourishes',
  },
  watermarking: {
    label: 'Applying finishing varnish…',
    sublabel: 'Protecting your preview with a subtle Wondertone mark',
  },
  ready: {
    label: 'Preview ready',
    sublabel: 'Take a look inside the Wondertone atelier',
  },
  error: {
    label: 'Preview failed',
    sublabel: 'Wondertone is resetting the studio tools',
  },
};

interface StyleForgeOverlayProps {
  status: StatusKey;
  styleName: string;
  message?: string | null;
  isError?: boolean;
  errorMessage?: string | null;
}

const StyleForgeOverlay = ({ status, styleName, message, isError, errorMessage }: StyleForgeOverlayProps) => {
  const progressIndexRaw = STATUS_ORDER.indexOf(status);
  const progressIndex = Math.max(0, Math.min(progressIndexRaw, STATUS_ORDER.length - 2));
  const info = STATUS_COPY[status] ?? STATUS_COPY.animating;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm" role="presentation">
      <div
        className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/90 p-8 shadow-founder text-center text-white"
        role="status"
        aria-live="polite"
        aria-busy={status !== 'ready'}
      >
        <div className="mb-6 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.4em] text-white/60">
          <span className="inline-flex h-2 w-2 rounded-full bg-purple-400" />
          <span>Style Forge</span>
          <span className="inline-flex h-2 w-2 rounded-full bg-blue-400" />
        </div>

        <h3 className="text-2xl font-semibold">
          {isError ? 'Something interrupted the magic' : `Crafting ${styleName}`}
        </h3>
        <p className="mt-2 text-sm text-white/70">
          {isError ? errorMessage ?? 'We could not finish this preview. Try again in a moment.' : message ?? info.label}
        </p>

        {!isError && info.sublabel && (
          <p className="mt-2 text-xs text-white/50">{info.sublabel}</p>
        )}

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-white/60">
            {STATUS_ORDER.slice(0, 4).map((key, idx) => (
              <div key={key} className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'inline-flex h-2 w-2 rounded-full transition-colors duration-300',
                      idx <= progressIndex
                        ? 'bg-gradient-to-r from-purple-400 to-blue-400'
                        : 'bg-white/10'
                    )}
                  />
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                    {key.replace(/^[a-z]/, (l) => l.toUpperCase())}
                  </span>
                </div>
              </div>
            ))}
          </div>

        <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, progressIndex / (STATUS_ORDER.length - 1) * 100)}%` }}
          />
        </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-purple-400" />
            <span>Wondertone studio engaged</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-400" />
            <span>GPT-Image-1 artistry in motion</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleForgeOverlay;
