import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import type { PendingState } from '@/sections/studio/gallery/types';
import { trackGalleryQuickviewAnimationComplete } from '@/utils/galleryQuickviewTelemetry';

type UseGallerySelectionOptions = {
  items: GalleryQuickviewItem[];
  ready: boolean;
  requiresWatermark: boolean | null;
  loadGalleryItem: (item: GalleryQuickviewItem, requiresWatermark: boolean | null, position: number) => Promise<void>;
};

export const useGallerySelection = ({
  items,
  ready,
  requiresWatermark,
  loadGalleryItem,
}: UseGallerySelectionOptions) => {
  const [pending, setPending] = useState<PendingState | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const firstItemRef = useRef<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ready || !items.length) return;
    const firstId = items[0]?.id ?? null;
    if (firstId && firstId !== firstItemRef.current) {
      firstItemRef.current = firstId;
      if (!prefersReducedMotion) {
        setHighlightId(firstId);
        const timeout = window.setTimeout(() => setHighlightId(null), 1200);
        return () => window.clearTimeout(timeout);
      }
    }
    return undefined;
  }, [items, ready, prefersReducedMotion]);

  useEffect(() => {
    if (!highlightId) return;
    trackGalleryQuickviewAnimationComplete(highlightId);
  }, [highlightId]);

  const handleSelect = useCallback(
    async (item: GalleryQuickviewItem) => {
      if (pending) return;
      setPending({ id: item.id, startedAt: Date.now() });
      try {
        await loadGalleryItem(item, requiresWatermark, item.position);
      } catch (error) {
        console.error('[GalleryQuickview] Failed to load gallery item', error);
      } finally {
        setPending((current) => (current?.id === item.id ? null : current));
      }
    },
    [pending, loadGalleryItem, requiresWatermark]
  );

  return {
    pending,
    highlightId,
    handleSelect,
  };
};

export default useGallerySelection;
