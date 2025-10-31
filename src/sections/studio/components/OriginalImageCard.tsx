import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useUploadState } from '@/store/hooks/useUploadStore';
import { useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';
import { useHandleStyleSelect } from '@/sections/studio/hooks/useHandleStyleSelect';
import { usePreviewLockState } from '@/store/hooks/usePreviewStore';

export default function OriginalImageCard() {
  const { originalImage } = useUploadState();
  const { selectedStyleId } = useStyleCatalogState();
  const handleStyleSelect = useHandleStyleSelect();
  const { isLocked: previewLocked } = usePreviewLockState();

  const isSelected = selectedStyleId === 'original-image';

  if (!originalImage) {
    return null;
  }

  // FIXED: Remove duplicate analytics emission - handleStyleSelect already emits
  const handleSelect = () => {
    if (previewLocked) {
      return;
    }
    handleStyleSelect('original-image', { tone: 'original' });
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleSelect}
        disabled={previewLocked}
        aria-disabled={previewLocked ? 'true' : 'false'}
        className={clsx(
          'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-400/50',
          isSelected
            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
            : clsx(
                'bg-white/5 border border-white/10',
                previewLocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/10'
              )
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
          <img
            src={originalImage}
            alt="Original uploaded photo"
            className="w-full h-full object-cover"
          />
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-500/40">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-white text-sm">Original Image</p>
          <p className="text-xs text-white/60 mt-0.5">Your photo untouched - classic canvas print</p>
        </div>
      </button>
    </div>
  );
}
