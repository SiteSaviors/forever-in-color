import { useEffect, useRef, useState } from 'react';
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

const ACTIVE_STATUS_SEQUENCE: StatusKey[] = ['animating', 'generating', 'polling', 'watermarking'];

const STUDIO_PHRASES = [
  'Spinning up studio engines',
  'Brewing the style model',
  'Calibrating the color brain',
  'Sampling secret sauce layers',
  'Rendering brush physics',
  'Fusing Wondertone style DNA',
  'Distilling composition rules',
  'Resolving fine edges',
  'Anti-blur shields engaged',
  'Finalizing render pass',
  'Squeezing paint tubes',
  'Buttering the canvas',
  'Shaking the glitter',
];

const PROGRESS_MILESTONES = [0, 0.1, 0.25, 0.4, 0.6, 0.75, 0.9, 0.95, 1];

const STAGE_PROGRESS_FLOOR: Partial<Record<StatusKey, number>> = {
  animating: 0.1,
  generating: 0.25,
  polling: 0.6,
  watermarking: 0.9,
  ready: 1,
  error: 1,
};

const SIMULATION_DURATION_MS = 20000;

interface StyleForgeOverlayProps {
  status: StatusKey;
  styleName: string;
  message?: string | null;
  isError?: boolean;
  errorMessage?: string | null;
}

const StyleForgeOverlay = ({ status, styleName, message, isError, errorMessage }: StyleForgeOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(() => Math.floor(Math.random() * STUDIO_PHRASES.length));
  const previousStatusRef = useRef<StatusKey | null>(null);
  const phraseTimerRef = useRef<number | null>(null);
  const simulationStartRef = useRef<number | null>(null);

  const progressIndexRaw = STATUS_ORDER.indexOf(status);
  const progressIndex = Math.max(0, Math.min(progressIndexRaw, STATUS_ORDER.length - 2));
  const info = STATUS_COPY[status] ?? STATUS_COPY.animating;
  const isActiveStage = !isError && ACTIVE_STATUS_SEQUENCE.includes(status);
  const activePhrase = STUDIO_PHRASES[phraseIndex % STUDIO_PHRASES.length];
  const primaryMessage = isError
    ? errorMessage ?? 'We could not finish this preview. Try again in a moment.'
    : isActiveStage
      ? activePhrase
      : message ?? info.label;
  const progressPercent = Math.min(100, Math.max(0, progress * 100));

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    if (status === 'animating' && previousStatus !== 'animating') {
      simulationStartRef.current = Date.now();
      setProgress(STAGE_PROGRESS_FLOOR.animating ?? 0);
      setPhraseIndex(Math.floor(Math.random() * STUDIO_PHRASES.length));
    } else if (ACTIVE_STATUS_SEQUENCE.includes(status) && simulationStartRef.current === null) {
      simulationStartRef.current = Date.now();
    }
    if ((status === 'ready' || status === 'error') && previousStatus !== status) {
      setProgress(1);
    }
    if (status === 'ready' || status === 'error') {
      simulationStartRef.current = null;
    }
    previousStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (status === 'ready' || status === 'error') {
      setProgress(1);
      return;
    }

    let frameId: number;
    const stepTowardTarget = () => {
      const startAt = simulationStartRef.current;
      const stageFloor = STAGE_PROGRESS_FLOOR[status] ?? 0;
      let target = stageFloor;

      if (startAt) {
        const elapsed = Date.now() - startAt;
        const normalized = Math.min(1, Math.max(0, elapsed / SIMULATION_DURATION_MS));
        const cappedIndex = PROGRESS_MILESTONES.length - 2;
        const scaled = normalized * cappedIndex;
        const lowerIndex = Math.floor(scaled);
        const upperIndex = Math.min(cappedIndex, lowerIndex + 1);
        const fraction = scaled - lowerIndex;
        const lowerValue = PROGRESS_MILESTONES[lowerIndex] ?? 0;
        const upperValue = PROGRESS_MILESTONES[upperIndex] ?? lowerValue;
        const milestoneProgress = lowerValue + (upperValue - lowerValue) * fraction;
        target = Math.max(target, milestoneProgress);
      }

      target = Math.min(target, PROGRESS_MILESTONES[PROGRESS_MILESTONES.length - 2]);

      setProgress((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.001) {
          return target;
        }

        const delta = Math.max(Math.abs(diff) * 0.12, 0.003);
        return diff > 0 ? Math.min(prev + delta, target) : Math.max(prev - delta, target);
      });

      frameId = requestAnimationFrame(stepTowardTarget);
    };

    frameId = requestAnimationFrame(stepTowardTarget);
    return () => cancelAnimationFrame(frameId);
  }, [status]);

  useEffect(() => {
    if (!ACTIVE_STATUS_SEQUENCE.includes(status)) {
      if (phraseTimerRef.current) {
        window.clearInterval(phraseTimerRef.current);
        phraseTimerRef.current = null;
      }
      return;
    }

    if (phraseTimerRef.current) {
      window.clearInterval(phraseTimerRef.current);
    }

    phraseTimerRef.current = window.setInterval(() => {
      setPhraseIndex((prev) => {
        if (STUDIO_PHRASES.length <= 1) {
          return prev;
        }

        let next = Math.floor(Math.random() * STUDIO_PHRASES.length);
        let attempts = 0;
        while (next === prev && attempts < 4) {
          next = Math.floor(Math.random() * STUDIO_PHRASES.length);
          attempts += 1;
        }
        return next;
      });
    }, 2600);

    return () => {
      if (phraseTimerRef.current) {
        window.clearInterval(phraseTimerRef.current);
        phraseTimerRef.current = null;
      }
    };
  }, [status]);

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
          {primaryMessage}
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
            style={{ width: `${progressPercent}%` }}
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
