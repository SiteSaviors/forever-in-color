import { useCallback, useEffect, useRef, useState } from 'react';
import { trackGalleryQuickviewScroll } from '@/utils/galleryQuickviewTelemetry';

export const useGalleryScroll = (itemsLength: number) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const itemsLengthRef = useRef(itemsLength);
  const [showStartFade, setShowStartFade] = useState(false);
  const [showEndFade, setShowEndFade] = useState(false);
  const [lastTrackedScrollIndex, setLastTrackedScrollIndex] = useState<number | null>(null);

  useEffect(() => {
    itemsLengthRef.current = itemsLength;
  }, [itemsLength]);

  const updateScrollHints = useCallback(() => {
    const container = listRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const canScroll = scrollWidth > clientWidth + 1;
    setShowStartFade(canScroll && scrollLeft > 4);
    setShowEndFade(canScroll && scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollHints();
  }, [updateScrollHints, itemsLength]);

  const handleScroll = useCallback(
    () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = window.requestAnimationFrame(() => {
        updateScrollHints();
        const container = listRef.current;
        if (!container) return;
        const firstChild = container.querySelector<HTMLElement>('[data-quickview-item]');
        if (!firstChild) return;
        const cardWidth = firstChild.getBoundingClientRect().width || 1;
        const lastVisible = Math.min(
          itemsLengthRef.current - 1,
          Math.floor((container.scrollLeft + container.clientWidth) / cardWidth) - 1
        );
        if (lastVisible !== lastTrackedScrollIndex) {
          setLastTrackedScrollIndex(lastVisible);
          trackGalleryQuickviewScroll(lastVisible);
        }
      });
    },
    [lastTrackedScrollIndex, updateScrollHints]
  );

  useEffect(
    () => () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  return {
    listRef,
    showStartFade,
    showEndFade,
    handleScroll,
    refreshScrollHints: updateScrollHints,
  };
};

export default useGalleryScroll;
