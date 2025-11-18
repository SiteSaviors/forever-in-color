import GalleryDeleteControls from '@/sections/studio/gallery/GalleryDeleteControls';

type GalleryQuickviewHeaderProps = {
  hasItems: boolean;
  deleteMode: boolean;
  onRefresh: () => void;
  onToggleDeleteMode?: () => void;
  showDeleteControls?: boolean;
};

const GalleryQuickviewHeader = ({
  hasItems,
  deleteMode,
  onRefresh,
  onToggleDeleteMode,
  showDeleteControls = true,
}: GalleryQuickviewHeaderProps) => (
  <div className="mb-3 space-y-1 text-white/70">
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <p className="text-xs uppercase tracking-[0.32em] text-white/45">Recent Gallery Saves</p>
      <div role="toolbar" aria-label="Gallery quickview actions" className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="text-[11px] font-semibold text-white/50 transition hover:text-white/80"
        >
          Refresh
        </button>
        {showDeleteControls && onToggleDeleteMode && (
          <GalleryDeleteControls
            hasItems={hasItems}
            deleteMode={deleteMode}
            onRefresh={onRefresh}
            onToggleDeleteMode={onToggleDeleteMode}
          />
        )}
      </div>
    </div>
    <span role="status" aria-live="polite" className="sr-only">
      {deleteMode ? 'Delete mode on' : 'Delete mode off'}
    </span>
  </div>
);

export default GalleryQuickviewHeader;
