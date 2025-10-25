import { memo, useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { STUDIO_V2_COPY } from '@/config/studioV2Copy';
import { trackStudioV2StoryShareClick } from '@/utils/studioV2Analytics';
import type { StudioToastPayload } from '@/hooks/useStudioFeedback';

type ShareBadgesProps = {
  styleId: string;
  styleName: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  onToast?: (toast: StudioToastPayload) => void;
};

type SharePlatform = 'twitter' | 'facebook' | 'pinterest' | 'copy';

const SHARE_CONFIG: Array<{
  platform: SharePlatform;
  label: string;
  hrefBuilder?: (url: string, caption: string) => string;
}> = [
  {
    platform: 'twitter',
    label: 'Twitter',
    hrefBuilder: (url, caption) =>
      `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(caption)}`,
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    hrefBuilder: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    platform: 'pinterest',
    label: 'Pinterest',
    hrefBuilder: (url, caption) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(caption)}`,
  },
  {
    platform: 'copy',
    label: 'Copy Link',
  },
];

const ShareBadges = ({ styleId, styleName, previewUrl, thumbnailUrl, onToast }: ShareBadgesProps) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, [styleId]);
  const caption = STUDIO_V2_COPY.shareCaption(styleName);
  const shareUrl = previewUrl ?? window.location.href;
  const previewImage = previewUrl ?? thumbnailUrl ?? undefined;

  const notify = useCallback(
    (payload: StudioToastPayload) => {
      onToast?.(payload);
    },
    [onToast]
  );

  const handleShare = useCallback(
    async (platform: SharePlatform) => {
      trackStudioV2StoryShareClick({ styleId, platform });

      if (platform === 'copy') {
        try {
          await navigator.clipboard.writeText(`${shareUrl}\n\n${caption}`);
          notify({
            title: 'Link copied',
            description: 'Share it anywhere—your Wondertone preview is ready to show off.',
            variant: 'success',
          });
          trackStudioV2StoryShareClick({ styleId, platform, status: 'success' });
        } catch (_error) {
          notify({
            title: 'Copy unavailable',
            description: 'Clipboard access was blocked. Long press to copy manually.',
            variant: 'warning',
          });
          trackStudioV2StoryShareClick({ styleId, platform, status: 'fallback' });
        }
        return;
      }

      const config = SHARE_CONFIG.find((item) => item.platform === platform);
      if (!config?.hrefBuilder) return;

      const href = config.hrefBuilder(shareUrl, caption);
      window.open(href, '_blank', 'noopener,noreferrer,width=600,height=700');
      trackStudioV2StoryShareClick({ styleId, platform, status: 'success' });
    },
    [caption, notify, shareUrl, styleId]
  );

  return (
    <section
      className={clsx(
        'space-y-4 rounded-[28px] border border-white/12 bg-white/[0.02] p-6 text-white shadow-[0_24px_70px_rgba(8,15,28,0.4)] transition-all duration-500 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <header>
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Share the Magic</p>
        <p className="mt-2 text-sm text-white/70">Show your Wondertone transformation with one tap.</p>
      </header>
      {previewImage ? (
        <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 p-3">
          <img
            src={previewImage}
            alt="Preview thumbnail"
            className="h-12 w-12 rounded-xl object-cover"
          />
          <p className="text-xs text-white/70 leading-snug">
            {caption}
          </p>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {SHARE_CONFIG.map((config) => (
          <button
            key={config.platform}
            type="button"
            onClick={() => void handleShare(config.platform)}
            title={`Share on ${config.label}`}
            className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
          >
            {config.label}
          </button>
        ))}
      </div>
      <footer className="text-xs text-white/55 leading-relaxed">{caption}</footer>
    </section>
  );
};

export default memo(ShareBadges);
