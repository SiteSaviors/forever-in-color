import { useCallback, useEffect, useMemo, useRef } from 'react';
import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';
import { fetchGalleryItems } from '@/utils/galleryApi';
import { useStudioUserState } from './useStudioUserState';
import type { GalleryQuickviewItem, GalleryStatus } from '@/store/founder/storeTypes';
import type { GalleryItem } from '@/utils/galleryApi';
import {
  trackGalleryQuickviewFetchError,
  trackGalleryQuickviewLoad,
} from '@/utils/galleryQuickviewTelemetry';

const QUICKVIEW_LIMIT = 15;
const STALE_THRESHOLD_MS = 60 * 1000;

const mapOrientation = (value: string | null | undefined): 'square' | 'horizontal' | 'vertical' => {
  switch ((value ?? '').toLowerCase()) {
    case 'horizontal':
      return 'horizontal';
    case 'vertical':
      return 'vertical';
    default:
      return 'square';
  }
};

const mapGalleryItem = (item: GalleryItem, index: number): GalleryQuickviewItem => ({
  id: item.id,
  styleId: item.styleId,
  styleName: item.styleName,
  orientation: mapOrientation(item.orientation),
  thumbnailUrl: item.thumbnailUrl ?? null,
  imageUrl: item.imageUrl,
  displayUrl: item.displayUrl ?? item.imageUrl,
  storagePath: item.storagePath,
  previewLogId: item.previewLogId ?? null,
  sourceStoragePath: item.sourceStoragePath ?? null,
  sourceDisplayUrl: item.sourceDisplayUrl ?? null,
  sourceSignedUrl: item.sourceSignedUrl ?? null,
  sourceSignedUrlExpiresAt: item.sourceSignedUrlExpiresAt ?? null,
  cropConfig: item.cropConfig ?? null,
  savedAt: item.createdAt ?? item.updatedAt ?? new Date().toISOString(),
  position: index,
});

type FetchOptions = {
  force?: boolean;
};

export const useGalleryQuickview = () => {
  const { sessionAccessToken, isAuthenticated } = useStudioUserState();
  const {
    galleryItems,
    galleryStatus,
    galleryError,
    galleryRequiresWatermark,
    lastFetchedAt,
    setGalleryItems,
    setGalleryStatus,
    setGalleryError,
    clearGallery,
    invalidateGallery,
    removeGalleryItem,
  } = useFounderStore(
    (state) => ({
      galleryItems: state.galleryItems,
      galleryStatus: state.galleryStatus,
      galleryError: state.galleryError,
      galleryRequiresWatermark: state.galleryRequiresWatermark,
      lastFetchedAt: state.lastFetchedAt,
      setGalleryItems: state.setGalleryItems,
      setGalleryStatus: state.setGalleryStatus,
      setGalleryError: state.setGalleryError,
      clearGallery: state.clearGallery,
      invalidateGallery: state.invalidateGallery,
      removeGalleryItem: state.removeGalleryItem,
    }),
    shallow
  );

  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(true);
  const loadTrackedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchQuickview = useCallback(
    async (options: FetchOptions = {}) => {
      if (!isAuthenticated) {
        clearGallery();
        return;
      }

      if (fetchPromiseRef.current) {
        if (!options.force) return fetchPromiseRef.current;
      }

      const executeFetch = async () => {
        if (options.force) {
          loadTrackedRef.current = false;
        }
        try {
          setGalleryStatus('loading');
          setGalleryError(null);

          const response = await fetchGalleryItems(
            { limit: QUICKVIEW_LIMIT, sort: 'newest' },
            sessionAccessToken ?? undefined
          );

          if ('error' in response) {
            throw new Error(response.error);
          }

          const mappedItems = response.items.slice(0, QUICKVIEW_LIMIT).map(mapGalleryItem);

          if (mountedRef.current) {
            setGalleryItems(mappedItems, response.requiresWatermark ?? null);
            if (!loadTrackedRef.current) {
              trackGalleryQuickviewLoad(mappedItems.length);
              loadTrackedRef.current = true;
            }
          }
        } catch (error) {
          if (!mountedRef.current) return;

          console.error('[useGalleryQuickview] Failed to fetch gallery items', error);
          const message = error instanceof Error ? error.message : 'Unknown error';
          setGalleryError(message);
          trackGalleryQuickviewFetchError(message);
        } finally {
          fetchPromiseRef.current = null;
        }
      };

      const promise = executeFetch();
      fetchPromiseRef.current = promise;
      return promise;
    },
    [
      isAuthenticated,
      sessionAccessToken,
      setGalleryStatus,
      setGalleryError,
      setGalleryItems,
      clearGallery,
    ]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      if (galleryItems.length) {
        clearGallery();
      }
      loadTrackedRef.current = false;
      return;
    }

    const isStale =
      !lastFetchedAt || Date.now() - lastFetchedAt > STALE_THRESHOLD_MS || galleryStatus === 'idle';

    if (isStale && galleryStatus !== 'loading') {
      void fetchQuickview({ force: !lastFetchedAt });
    }
  }, [isAuthenticated, galleryItems.length, lastFetchedAt, galleryStatus, fetchQuickview, clearGallery]);

  const refresh = useCallback(() => fetchQuickview({ force: true }), [fetchQuickview]);
  const loading = galleryStatus === 'loading';
  const ready = galleryStatus === 'ready';

  const items = useMemo(() => galleryItems, [galleryItems]);

  return {
    items,
    status: galleryStatus as GalleryStatus,
    loading,
    ready,
    error: galleryError,
    requiresWatermark: galleryRequiresWatermark,
    refresh,
    invalidate: invalidateGallery,
    removeItem: removeGalleryItem,
  };
};
