import { useCallback, useEffect, useState } from 'react';
import { deleteGalleryItem } from '@/utils/galleryApi';
import { deletePreviewCacheEntries } from '@/store/previewCacheStore';
import {
  trackGalleryQuickviewDeleteModeChanged,
  trackGalleryQuickviewDeleteRequested,
  trackGalleryQuickviewDeleteResult,
} from '@/utils/galleryQuickviewTelemetry';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import type { DeleteErrorCode } from '@/sections/studio/gallery/deleteUtils';
import { isOffline, resolveDeleteError } from '@/sections/studio/gallery/deleteUtils';

type OpenAuthModalFn = (view: 'signin' | 'signup', options?: { source?: string }) => void;

type UseGalleryDeleteQueueOptions = {
  hasItems: boolean;
  surface: 'desktop' | 'mobile';
  hasUpload: boolean;
  sessionAccessToken: string | null;
  removeItem: (id: string) => void;
  showToast: (payload: { title: string; description: string; variant: 'error' | 'success' }) => void;
  openAuthModal: OpenAuthModalFn;
  restoreOriginalImagePreview: (styleId: string) => boolean;
  resetPreviewToEmptyState: (styleId: string) => void;
};

export const useGalleryDeleteQueue = ({
  hasItems,
  surface,
  hasUpload,
  sessionAccessToken,
  removeItem,
  showToast,
  openAuthModal,
  restoreOriginalImagePreview,
  resetPreviewToEmptyState,
}: UseGalleryDeleteQueueOptions) => {
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmItem, setConfirmItem] = useState<GalleryQuickviewItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasItems && deleteMode) {
      setDeleteMode(false);
      trackGalleryQuickviewDeleteModeChanged({ active: false, surface });
    }
  }, [hasItems, deleteMode, surface]);

  const setDeleteModeWithTracking = useCallback(
    (next: boolean) => {
      setDeleteMode(next);
      trackGalleryQuickviewDeleteModeChanged({ active: next, surface });
    },
    [surface]
  );

  const toggleDeleteMode = useCallback(() => {
    if (!hasItems) return;
    setDeleteModeWithTracking(!deleteMode);
  }, [deleteMode, hasItems, setDeleteModeWithTracking]);

  const handleDeleteIntent = useCallback((item: GalleryQuickviewItem) => {
    setConfirmItem(item);
  }, []);

  const handleCloseModal = useCallback(() => setConfirmItem(null), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmItem || deletingId) return;
    const item = confirmItem;

    trackGalleryQuickviewDeleteRequested({
      artId: item.id,
      styleId: item.styleId,
      position: item.position,
      surface,
      hasUpload,
    });

    const startedAt = performance.now();
    const emitFailure = (code: DeleteErrorCode, message: string, status?: number) => {
      showToast({
        title: 'Delete failed',
        description: message,
        variant: 'error',
      });
      trackGalleryQuickviewDeleteResult({
        artId: item.id,
        styleId: item.styleId,
        success: false,
        surface,
        durationMs: performance.now() - startedAt,
        status,
        errorCode: code,
      });
    };

    if (!sessionAccessToken) {
      openAuthModal('signin', { source: 'gallery-quickview' });
      emitFailure('auth', 'Please sign in to manage your gallery.');
      return;
    }

    if (isOffline()) {
      emitFailure('network', 'You appear to be offline. Reconnect and try again.');
      return;
    }

    setDeletingId(item.id);

    try {
      const response = await deleteGalleryItem(item.id, sessionAccessToken);
      if (!response.success) {
        const error = new Error(response.error || 'Failed to delete gallery item');
        (error as { status?: number }).status = response.status;
        throw error;
      }

      removeItem(item.id);
      deletePreviewCacheEntries(item.styleId);
      const restored = restoreOriginalImagePreview(item.styleId);
      if (!restored) {
        resetPreviewToEmptyState(item.styleId);
      }

      setConfirmItem(null);
      showToast({
        title: 'Removed from gallery',
        description: `${item.styleName} has been deleted.`,
        variant: 'success',
      });

      trackGalleryQuickviewDeleteResult({
        artId: item.id,
        styleId: item.styleId,
        success: true,
        surface,
        durationMs: performance.now() - startedAt,
        status: response.status,
      });
    } catch (rawError) {
      const { message, code, status } = resolveDeleteError(rawError);
      if (code === 'auth') {
        openAuthModal('signin', { source: 'gallery-quickview' });
      }
      emitFailure(code, message, status);
    } finally {
      setDeletingId(null);
    }
  }, [
    confirmItem,
    deletingId,
    surface,
    hasUpload,
    showToast,
    sessionAccessToken,
    openAuthModal,
    removeItem,
    restoreOriginalImagePreview,
    resetPreviewToEmptyState,
  ]);

  return {
    deleteMode,
    toggleDeleteMode,
    setDeleteModeWithTracking,
    confirmItem,
    deletingId,
    handleDeleteIntent,
    handleCloseModal,
    handleConfirmDelete,
  };
};

export default useGalleryDeleteQueue;
