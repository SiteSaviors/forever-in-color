import type { ReactNode, RefObject } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { clsx } from 'clsx';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';

type GalleryScrollContainerProps = {
  items: GalleryQuickviewItem[];
  renderItem: (item: GalleryQuickviewItem) => ReactNode;
  contentClassName?: string;
  listRef: RefObject<HTMLDivElement>;
  showStartFade: boolean;
  showEndFade: boolean;
  onScroll: () => void;
};

const GalleryScrollContainer = ({
  items,
  renderItem,
  contentClassName,
  listRef,
  showStartFade,
  showEndFade,
  onScroll,
}: GalleryScrollContainerProps) => (
  <div className="relative">
    <div
      className={clsx(
        'pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-900 to-transparent transition-opacity duration-200',
        showStartFade ? 'opacity-100' : 'opacity-0'
      )}
    />
    <div
      className={clsx(
        'pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-900 to-transparent transition-opacity duration-200',
        showEndFade ? 'opacity-100' : 'opacity-0'
      )}
    />
    <LayoutGroup>
      <div
        ref={listRef}
        className={clsx(
          'flex overflow-x-auto scroll-smooth pb-1 pl-2 pr-2',
          contentClassName ?? 'gap-1',
          'snap-x snap-mandatory scrollbar-hide',
          'min-w-0'
        )}
        onScroll={onScroll}
        role="list"
      >
        <AnimatePresence initial={false}>{items.map((item) => renderItem(item))}</AnimatePresence>
      </div>
    </LayoutGroup>
    <div
      className={clsx(
        'pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-900 to-transparent transition-opacity duration-200',
        showStartFade ? 'opacity-100' : 'opacity-0'
      )}
    />
    <div
      className={clsx(
        'pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 to-transparent transition-opacity duration-200',
        showEndFade ? 'opacity-100' : 'opacity-0'
      )}
    />
  </div>
);

export default GalleryScrollContainer;
