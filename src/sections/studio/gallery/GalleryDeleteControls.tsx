import { clsx } from 'clsx';

type GalleryDeleteControlsProps = {
  hasItems: boolean;
  deleteMode: boolean;
  onToggleDeleteMode: () => void;
};

const GalleryDeleteControls = ({ hasItems, deleteMode, onToggleDeleteMode }: GalleryDeleteControlsProps) => {
  if (!hasItems) return null;
  return (
    <>
      <button
        type="button"
        onClick={onToggleDeleteMode}
        className="hidden md:inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] transition hover:border-white/40"
      >
        {deleteMode ? 'Done' : 'Manage'}
      </button>
      <button
        type="button"
        onClick={onToggleDeleteMode}
        className={clsx(
          'inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] transition hover:border-white/40 md:hidden',
          deleteMode ? 'bg-white/10 text-white' : 'text-white/70'
        )}
      >
        {deleteMode ? 'Done' : 'Delete'}
      </button>
    </>
  );
};

export default GalleryDeleteControls;
