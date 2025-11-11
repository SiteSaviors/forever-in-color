import { X, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DownloadUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadUpgradeModal({ isOpen, onClose }: DownloadUpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-brand-indigo to-purple-600">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white mb-3">
            Unlock Unwatermarked Downloads
          </h2>

          {/* Subtitle */}
          <p className="text-center text-white/70 mb-8">
            Subscribe to download high-resolution, unwatermarked images of all your creations.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand-indigo flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold">Download HD images without watermarks</p>
                <p className="text-sm text-white/60">Get clean, print-ready files for all your generations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand-indigo flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold">50-400 generations per month</p>
                <p className="text-sm text-white/60">Create more art with increased monthly quotas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand-indigo flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold">Priority generation queue</p>
                <p className="text-sm text-white/60">Get your images faster with premium processing</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-brand-indigo to-purple-600 hover:from-brand-indigo/90 hover:to-purple-600/90 text-white transition-all shadow-lg hover:shadow-xl"
            >
              View Plans & Pricing
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white transition-all border border-white/20"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
