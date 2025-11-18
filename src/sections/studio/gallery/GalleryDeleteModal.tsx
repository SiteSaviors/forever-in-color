import { clsx } from 'clsx';
import Modal from '@/components/ui/Modal';
import { Trash2 } from 'lucide-react';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';

type GalleryDeleteModalProps = {
  confirmItem: GalleryQuickviewItem | null;
  deletingId: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

const GalleryDeleteModal = ({
  confirmItem,
  deletingId,
  onClose,
  onConfirm,
}: GalleryDeleteModalProps) => (
  <Modal
    open={Boolean(confirmItem)}
    onOpenChange={(next) => !next && onClose()}
    overlayClassName="bg-transparent"
    contentClassName="max-w-md border border-white/10 bg-slate-950/95 px-8 py-8 shadow-[0_32px_120px_rgba(8,14,32,0.8)]"
    className="items-center justify-center"
  >
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
          <Trash2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl text-white">Delete “{confirmItem?.styleName}”?</h3>
          <p className="text-sm text-white/70">This removes the preview from Wondertone Studio.</p>
        </div>
      </div>

      {confirmItem && (
        <div className="mx-auto max-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2">
          <img
            src={confirmItem.displayUrl ?? confirmItem.imageUrl}
            alt={confirmItem.styleName}
            className="aspect-square w-full rounded-xl object-cover"
          />
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
        This can’t be undone
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
          disabled={Boolean(deletingId)}
        >
          Keep preview
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={Boolean(deletingId)}
          className={clsx(
            'rounded-full bg-gradient-to-r from-rose-500 via-rose-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(244,63,94,0.6)] transition hover:shadow-[0_20px_50px_rgba(244,63,94,0.8)]',
            deletingId && 'opacity-70 cursor-not-allowed'
          )}
        >
          {deletingId ? 'Deleting…' : 'Delete preview'}
        </button>
      </div>
    </div>
  </Modal>
);

export default GalleryDeleteModal;
