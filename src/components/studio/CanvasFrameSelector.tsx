import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  useCanvasConfigActions,
  useCanvasModalStatus,
  useCanvasSelection,
} from '@/store/hooks/useCanvasConfigStore';
import type { FrameColor } from '@/store/founder/storeTypes';

export type FrameOption = {
  id: FrameColor;
  label: string;
  thumbnail: string;
  subtitle: string;
};

const FRAME_OPTIONS: FrameOption[] = [
  {
    id: 'none',
    label: 'Gallery Wrap',
    thumbnail: '/frame-swatches/no-frame.webp',
    subtitle: 'Wrapped edges, ready to hang',
  },
  {
    id: 'black',
    label: 'Black Floating',
    thumbnail: '/frame-swatches/black-frame-thumbnail.webp',
    subtitle: 'Adds depth with a modern profile',
  },
  {
    id: 'white',
    label: 'White Floating',
    thumbnail: '/frame-swatches/white-frame-thumbnail.webp',
    subtitle: 'Bright gallery look with crisp lines',
  },
];

const CanvasFrameSelectorComponent = () => {
  const { selectedFrame, enhancements } = useCanvasSelection();
  const { orientationPreviewPending } = useCanvasModalStatus();
  const { setFrame, toggleEnhancement } = useCanvasConfigActions();

  const floatingFrame = useMemo(
    () => enhancements.find((item) => item.id === 'floating-frame'),
    [enhancements]
  );

  const handleFrameSelect = (frame: FrameColor) => {
    if (frame === 'none') {
      if (floatingFrame?.enabled) {
        toggleEnhancement('floating-frame');
      }
      if (selectedFrame !== 'none') {
        setFrame('none');
      }
      return;
    }

    if (!floatingFrame?.enabled) {
      toggleEnhancement('floating-frame');
    }

    if (selectedFrame !== frame) {
      setFrame(frame);
    }
  };

  return (
    <div className="flex gap-3" data-section="frame-selection">
      {FRAME_OPTIONS.map((option) => {
        const active = selectedFrame === option.id;
        const isDisabled = option.id !== 'none' && orientationPreviewPending;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleFrameSelect(option.id)}
            disabled={isDisabled}
            className={clsx(
              'group flex flex-1 items-center gap-3 rounded-full border px-5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              active
                ? 'scale-[1.02] border-purple-400 bg-purple-500/15 text-white shadow-glow-purple'
                : 'border-white/15 bg-white/5 text-white/70 hover:scale-[1.02] hover:border-white/30 hover:bg-white/10',
              !active && 'active:scale-[0.98]',
              isDisabled && 'cursor-not-allowed opacity-40'
            )}
          >
            <span
              className={clsx(
                'h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-white/5',
                active ? 'border-purple-400/50' : 'border-white/10'
              )}
            >
              <img
                src={option.thumbnail}
                alt={`${option.label} thumbnail`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </span>
            <p className="font-display text-base font-semibold text-white">{option.label}</p>
            {active && (
              <svg
                className="ml-auto h-5 w-5 shrink-0 text-purple-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};

const CanvasFrameSelector = memo(CanvasFrameSelectorComponent);

export default CanvasFrameSelector;
