import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import type { MouseEvent, PointerEvent } from 'react';

type GalleryThumbnailCardProps = {
  item: GalleryQuickviewItem;
  isActive: boolean;
  isPending: boolean;
  highlight: boolean;
  deleteMode: boolean;
  isMobileSurface: boolean;
  orientationLabel: string;
  showDeleteAction?: boolean;
  onSelect: () => void;
  onDeleteIntent: (event: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  onPointerCancel?: () => void;
};

const GalleryThumbnailCard = ({
  item,
  isActive,
  isPending,
  highlight,
  deleteMode,
  isMobileSurface,
  orientationLabel,
  showDeleteAction = true,
  onSelect,
  onDeleteIntent,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}: GalleryThumbnailCardProps) => (
  <motion.div
    key={item.id}
    data-quickview-item
    layout
    layoutId={item.id}
    initial={highlight ? { opacity: 0, y: -32, scale: 0.92 } : false}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 32 }}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    className={clsx(
      'group relative flex w-[112px] shrink-0 flex-col gap-2 rounded-3xl border border-transparent bg-white/[0.02] p-2 transition',
      'hover:border-white/20 hover:bg-white/[0.06]',
      'md:w-[104px] sm:w-[92px]',
      isActive && 'border-purple-400/70 bg-purple-500/10 shadow-glow-purple/30',
      isPending && 'pointer-events-none opacity-70',
      deleteMode && isMobileSurface && 'quickview-card-wiggle'
    )}
    role="listitem"
    onPointerDown={onPointerDown}
    onPointerUp={onPointerUp}
    onPointerLeave={onPointerLeave}
    onPointerCancel={onPointerCancel}
  >
    <button
      type="button"
      className="flex flex-col gap-2 text-left"
      aria-label={`Load saved art "${item.styleName}", ${orientationLabel} orientation`}
      aria-pressed={isActive}
      onClick={onSelect}
    >
      <div className="relative">
        <motion.div
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          layoutId={`${item.id}-preview`}
        >
          <img
            src={item.thumbnailUrl ?? item.imageUrl}
            alt={item.styleName}
            className="aspect-square w-full select-none object-cover"
            draggable={false}
          />
        </motion.div>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
          </div>
        )}
      </div>
      <div className="min-h-[32px] text-center">
        <p className="mx-auto line-clamp-2 text-xs font-semibold text-white/80 group-hover:text-white">
          {item.styleName}
        </p>
      </div>
    </button>

    {showDeleteAction && (
      <button
        type="button"
        onClick={onDeleteIntent}
        className={clsx(
          'absolute -right-2.5 -top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-slate-950 text-white/80 shadow-[0_12px_30px_rgba(8,14,32,0.55)] transition',
          'hover:text-white hover:border-white/70 hover:bg-slate-950/95',
          isMobileSurface
            ? deleteMode
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
            : deleteMode
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
        )}
        aria-label={`Delete saved art "${item.styleName}"`}
        aria-hidden={isMobileSurface && !deleteMode}
        tabIndex={isMobileSurface && !deleteMode ? -1 : 0}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ×
        </span>
      </button>
    )}
  </motion.div>
);

export default GalleryThumbnailCard;
