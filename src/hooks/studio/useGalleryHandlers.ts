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
    if (!currentStyle || !preview?.data?.previewUrl) {
      showToast({
        title: 'Nothing to save',
        description: 'Generate a preview before saving to your gallery.',
        variant: 'warning',
      });
      return;
    }

    if (!sessionUser) {
      openAuthModal('signup');
      return;
    }

    setSavingToGallery(true);

    const storagePath =
      preview.data.storagePath ??
      (preview.data.storageUrl ? extractStoragePathFromUrl(preview.data.storageUrl) : null) ??
      extractStoragePathFromUrl(preview.data.previewUrl);

    if (!storagePath) {
      console.error('[useGalleryHandlers] Missing storage path when saving to gallery', preview.data);
      showToast({
        title: 'Save failed',
        description: 'Unable to save preview. Please regenerate and try again.',
        variant: 'error',
      });
      setSavingToGallery(false);
      return;
    }

    const previewLogId = preview.data.previewLogId;
    if (!previewLogId) {
      console.error('[useGalleryHandlers] Missing previewLogId for gallery save', preview.data);
      showToast({
        title: 'Save failed',
        description: 'Unable to save preview metadata. Please regenerate and try again.',
        variant: 'error',
      });
      setSavingToGallery(false);
      return;
    }

    const result = await saveToGallery({
      previewLogId,
      styleId: currentStyle.id,
      styleName: currentStyle.name,
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
          ? 'This preview already lives in your gallery.'
          : `${currentStyle.name} is now in your gallery.`,
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
    preview,
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
