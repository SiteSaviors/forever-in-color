import { Download, Lock, ShoppingBag } from 'lucide-react';
import { useFounderStore } from '@/store/useFounderStore';

type ActionRowProps = {
  onDownloadClick: () => void;
  onCanvasClick: () => void;
  downloadingHD: boolean;
  isPremiumUser: boolean;
  canvasConfigExpanded: boolean;
  disabled?: boolean;
};

export default function ActionRow({
  onDownloadClick,
  onCanvasClick,
  downloadingHD,
  isPremiumUser,
  canvasConfigExpanded,
  disabled = false,
}: ActionRowProps) {
  const entitlements = useFounderStore((state) => state.entitlements);
  const remainingTokens = entitlements?.tokens_remaining ?? 0;

  return (
    <div className="space-y-4">
      {/* Download Image Button */}
      <button
        onClick={onDownloadClick}
        disabled={downloadingHD || disabled}
        className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/10">
          {isPremiumUser ? (
            <Download className="w-5 h-5 text-white" />
          ) : (
            <Lock className="w-5 h-5 text-white/60" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">Download Image</p>
            {isPremiumUser && remainingTokens > 0 && (
              <span className="text-xs text-purple-300 font-semibold">
                {remainingTokens} {remainingTokens === 1 ? 'token' : 'tokens'} left
              </span>
            )}
          </div>
          <p className="text-xs text-white/60">
            {isPremiumUser
              ? 'Instant 4K files • Uses 1 token'
              : 'Upgrade to download watermark-free'}
          </p>
        </div>
      </button>

      {/* Create Canvas Button */}
      <button
        onClick={onCanvasClick}
        disabled={disabled}
        className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
          canvasConfigExpanded
            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-400/40 hover:border-purple-400/60'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            canvasConfigExpanded ? 'bg-purple-500 shadow-glow-soft' : 'bg-purple-500/50'
          }`}
        >
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Create Canvas</p>
          <p className="text-xs text-white/60">
            Handcrafted gallery canvas • Ships in 5 days
          </p>
        </div>
      </button>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
