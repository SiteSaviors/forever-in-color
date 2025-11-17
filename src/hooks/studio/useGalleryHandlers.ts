import { useCallback, useEffect, useRef, useState } from 'react';
import { saveToGallery } from '@/utils/galleryApi';
import { useStudioExperienceContext } from '@/sections/studio/experience/context';
import { useStudioPreviewState } from '@/store/hooks/studio/useStudioPreviewState';
import { useStudioUserState } from '@/store/hooks/studio/useStudioUserState';
import { useAuthModal } from '@/store/useAuthModal';
import { useFounderStore } from '@/store/useFounderStore';
import { extractStoragePathFromUrl } from '@/utils/storagePaths';


export const useGalleryHandlers = () => {
  const { showToast } = useStudioExperienceContext();
  const { currentStyle, preview, orientation } = useStudioPreviewState();
  const { sessionUser, sessionAccessToken } = useStudioUserState();
  const openAuthModal = useAuthModal((state) => state.openModal);
  const originalImageStoragePath = useFounderStore((state) => state.originalImageStoragePath);
  const originalImagePreviewLogId = useFounderStore((state) => state.originalImagePreviewLogId);

  const [savingToGallery, setSavingToGallery] = useState(false);
  const [savedToGallery, setSavedToGallery] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSaveToGallery = useCallback(async () => {
    if (!sessionUser) {
      openAuthModal('signup', {
        source: 'gallery-save',
        styleId: currentStyle?.id ?? undefined,
      });
      return;
    }

    setSavingToGallery(true);

    const hasPreviewPayload = Boolean(currentStyle && preview?.data?.previewUrl);
    const targetStyleId = hasPreviewPayload && currentStyle ? currentStyle.id : 'original-image';
    const targetStyleName = hasPreviewPayload && currentStyle ? currentStyle.name : 'Original Image';

    const previewStoragePath = hasPreviewPayload && preview?.data
      ? preview.data.storagePath ??
        (preview.data.storageUrl ? extractStoragePathFromUrl(preview.data.storageUrl) : null) ??
        extractStoragePathFromUrl(preview.data.previewUrl)
      : null;

    const storagePath = hasPreviewPayload ? previewStoragePath : originalImageStoragePath;

    if (!storagePath) {
      showToast({
        title: 'Upload required',
        description: 'Upload or select a photo before saving to your gallery.',
        variant: 'warning',
      });
      setSavingToGallery(false);
      return;
    }

    const previewLogId = hasPreviewPayload ? preview?.data?.previewLogId : originalImagePreviewLogId;
    if (!previewLogId) {
      console.warn('[useGalleryHandlers] Missing previewLogId for gallery save', {
        hasPreviewPayload,
        previewData: preview?.data,
      });
      showToast({
        title: 'Upload finalizing',
        description: 'Please wait a moment and try saving again.',
        variant: 'info',
      });
      setSavingToGallery(false);
      return;
    }

    const result = await saveToGallery({
      previewLogId,
      styleId: targetStyleId,
      styleName: targetStyleName,
      orientation,
      storagePath,
      accessToken: sessionAccessToken || null,
    });

    setSavingToGallery(false);

    if (result.success) {
      setSavedToGallery(true);
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        setSavedToGallery(false);
        resetTimerRef.current = null;
      }, 3000);

      showToast({
        title: result.alreadyExists ? 'Already saved' : 'Saved to gallery',
        description: result.alreadyExists
          ? 'This image already lives in your gallery.'
          : `${targetStyleName} is now in your gallery.`,
        variant: result.alreadyExists ? 'info' : 'success',
      });
      useFounderStore.getState().invalidateGallery();
      window.dispatchEvent(new CustomEvent('gallery-quickview-refresh'));
    } else {
      showToast({
        title: 'Save failed',
        description: result.error ?? 'Unexpected error while saving.',
        variant: 'error',
      });
    }
  }, [
    currentStyle,
    openAuthModal,
    orientation,
    originalImageStoragePath,
    preview,
    originalImagePreviewLogId,
    sessionAccessToken,
    sessionUser,
    showToast,
  ]);

  return {
    savingToGallery,
    savedToGallery,
    handleSaveToGallery,
  };
};
