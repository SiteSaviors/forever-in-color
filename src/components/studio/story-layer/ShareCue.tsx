import { memo } from 'react';
import { Copy, Download, Facebook, Instagram, Share2, Twitter } from 'lucide-react';

type ShareCueProps = {
  caption: string;
  copyState: 'idle' | 'success' | 'error';
  onCopy: () => Promise<void> | void;
  onDownload: () => void;
  isPremiumTier: boolean;
  onSocialShare: (channel: SocialChannel) => void;
};

export type SocialChannel = 'facebook' | 'instagram' | 'pinterest' | 'twitter';

const SOCIAL_ICONS: Record<SocialChannel, { label: string; Icon: typeof Facebook }> = {
  facebook: { label: 'Share to Facebook', Icon: Facebook },
  instagram: { label: 'Share to Instagram', Icon: Instagram },
  pinterest: { label: 'Share to Pinterest', Icon: Share2 },
  twitter: { label: 'Share to X / Twitter', Icon: Twitter },
};

const ShareCue = ({ caption, copyState, onCopy, onDownload, isPremiumTier, onSocialShare }: ShareCueProps) => {
  const copyLabel =
    copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Unable to copy' : 'Copy Story Caption';

  return (
    <div className="rounded-[2.5rem] border border-white/12 bg-slate-950/60 px-6 py-8 sm:px-10 sm:py-9 shadow-[0_20px_60px_rgba(18,28,47,0.45)]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.45em] text-white/55">Share</p>
        <h3 className="text-xl font-semibold text-white">Bring friends into your Wondertone story</h3>
        <p className="text-sm text-white/70 leading-relaxed">
          Copy the caption, download the preview, or send friends directly to Wondertone.
        </p>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
        <div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm text-white/70 leading-relaxed whitespace-pre-line shadow-innerBrand">
            {caption}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-glow-purple transition hover:shadow-glow-purple"
          >
            <Copy className="h-4 w-4" />
            {copyLabel}
          </button>
          <button
            type="button"
            onClick={isPremiumTier ? undefined : onDownload}
            disabled={isPremiumTier}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:text-white/35"
            title={
              isPremiumTier
                ? 'Premium downloads are coming soon for Creator and above.'
                : 'Upgrade to download this preview without watermarks.'
            }
          >
            <Download className="h-4 w-4" />
            Download Image
          </button>
          <div className="flex items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
            <span>Or share to</span>
            <div className="flex items-center gap-2">
              {(Object.entries(SOCIAL_ICONS) as Array<[SocialChannel, (typeof SOCIAL_ICONS)[SocialChannel]]>).map(
                ([channel, { label, Icon }]) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => onSocialShare(channel)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/85 transition hover:bg-white/20"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ShareCue);
