import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { downloadCleanImage } from '@/utils/premiumDownload';
import { trackDownloadSuccess } from '@/utils/telemetry';
import { useStudioExperienceContext, useStudioOverlayContext } from '@/sections/studio/experience/context';
import { useStudioPreviewState } from '@/store/hooks/studio/useStudioPreviewState';
import { useStudioEntitlementState } from '@/store/hooks/studio/useStudioEntitlementState';
import { useStudioUserState } from '@/store/hooks/studio/useStudioUserState';

const STORAGE_PATH_REGEX = /(preview-cache(?:-public|-premium)?\/.+)$/;

const extractStoragePathFromUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(STORAGE_PATH_REGEX);
  return match ? match[1] : null;
};

export const useDownloadHandlers = () => {
  const { showToast } = useStudioExperienceContext();
  const {
    openDownloadUpgrade,
    showCanvasUpsellToast,
    hideCanvasUpsellToast,
  } = useStudioOverlayContext();
  const { sessionAccessToken } = useStudioUserState();
  const { currentStyle, preview } = useStudioPreviewState();
  const { requiresWatermark, userTier } = useStudioEntitlementState();

  const [downloadingHD, setDownloadingHD] = useState(false);
  const [watermarkUpgradeShown, setWatermarkUpgradeShown] = useState(false);
  const upsellTimeoutRef = useRef<number | null>(null);

  const previewDownloadSource = useMemo(() => preview?.data?.previewUrl ?? null, [preview?.data?.previewUrl]);

  useEffect(() => {
    setWatermarkUpgradeShown(false);
  }, [currentStyle?.id, requiresWatermark]);

  useEffect(() => {
    return () => {
      if (upsellTimeoutRef.current) {
        window.clearTimeout(upsellTimeoutRef.current);
      }
      hideCanvasUpsellToast();
    };
  }, [hideCanvasUpsellToast]);

  const triggerDownloadFromBlob = useCallback((blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }, []);

  const handleDownloadHD = useCallback(async () => {
    if (!currentStyle || !previewDownloadSource || !preview?.data) {
      showToast({
        title: 'Download unavailable',
        description: 'Generate a preview before downloading.',
        variant: 'warning',
      });
      return;
    }

    setDownloadingHD(true);

    try {
      const filename = `wondertone-${currentStyle.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;

      if (requiresWatermark) {
        const response = await fetch(previewDownloadSource, { credentials: 'omit' });
        if (!response.ok) {
          throw new Error(`Failed to fetch watermarked preview (${response.status})`);
        }

        const blob = await response.blob();
        triggerDownloadFromBlob(blob, filename);

        if (!watermarkUpgradeShown) {
          setWatermarkUpgradeShown(true);
          openDownloadUpgrade();
        }
      } else {
        const storagePath =
          preview.data.storagePath ??
          (preview.data.storageUrl ? extractStoragePathFromUrl(preview.data.storageUrl) : null) ??
          extractStoragePathFromUrl(preview.data.previewUrl);

        if (!storagePath) {
          throw new Error('Could not extract storage path from preview URL');
        }

        await downloadCleanImage({
          storagePath,
          filename,
          accessToken: sessionAccessToken,
        });
      }

      trackDownloadSuccess(userTier, currentStyle.id);
      showCanvasUpsellToast();
      if (upsellTimeoutRef.current) {
        window.clearTimeout(upsellTimeoutRef.current);
      }
      upsellTimeoutRef.current = window.setTimeout(() => {
        hideCanvasUpsellToast();
        upsellTimeoutRef.current = null;
      }, 8000);
    } catch (error) {
      console.error('Failed to download HD image:', error);
      showToast({
        title: 'Download failed',
        description: 'Please try again in a moment.',
        variant: 'error',
      });
    } finally {
      setDownloadingHD(false);
    }
  }, [
    currentStyle,
    hideCanvasUpsellToast,
    openDownloadUpgrade,
    preview?.data,
    previewDownloadSource,
    requiresWatermark,
    sessionAccessToken,
    showCanvasUpsellToast,
    showToast,
    triggerDownloadFromBlob,
    userTier,
    watermarkUpgradeShown,
  ]);

  return {
    downloadingHD,
    handleDownloadHD,
  };
};

