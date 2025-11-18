import { useEffect, useRef, type PointerEvent } from 'react';
import { clsx } from 'clsx';
import { useGalleryQuickview, useGalleryQuickviewSelection, useStudioPreviewState } from '@/store/hooks/studio';
import { ENABLE_QUICKVIEW_DELETE_MODE } from '@/config/featureFlags';
import { useStudioExperienceContext } from '@/sections/studio/experience/context';
import { useStudioUserState } from '@/store/hooks/studio/useStudioUserState';
import { useFounderStore } from '@/store/useFounderStore';
import { useAuthModal } from '@/store/useAuthModal';
import GalleryQuickviewHeader from '@/sections/studio/gallery/GalleryQuickviewHeader';
import GallerySkeletonRow from '@/sections/studio/gallery/GallerySkeletonRow';
import GalleryEmptyState from '@/sections/studio/gallery/GalleryEmptyState';
import GalleryScrollContainer from '@/sections/studio/gallery/GalleryScrollContainer';
import GalleryThumbnailCard from '@/sections/studio/gallery/GalleryThumbnailCard';
import GalleryDeleteModal from '@/sections/studio/gallery/GalleryDeleteModal';
import useGalleryScroll from '@/sections/studio/gallery/hooks/useGalleryScroll';
import useGallerySelection from '@/sections/studio/gallery/hooks/useGallerySelection';
import useGalleryDeleteQueue from '@/sections/studio/gallery/hooks/useGalleryDeleteQueue';
import useGallerySurface from '@/sections/studio/gallery/hooks/useGallerySurface';
import useGalleryExternalRefresh from '@/sections/studio/gallery/hooks/useGalleryExternalRefresh';

const ORIENTATION_LABEL: Record<'square' | 'horizontal' | 'vertical', string> = {
  square: 'Square',
  horizontal: 'Landscape',
  vertical: 'Portrait',
};

const PLACEHOLDER_COUNT = 5;



const GalleryQuickviewLegacy = () => {
  const { items, loading, error, ready, requiresWatermark, refresh } = useGalleryQuickview();
  const loadGalleryItem = useGalleryQuickviewSelection();
  const { currentStyleId, preview } = useStudioPreviewState();
  const { pending, highlightId, handleSelect } = useGallerySelection({
    items,
    ready,
    requiresWatermark,
    loadGalleryItem,
  });
  const { listRef, showStartFade, showEndFade, handleScroll, refreshScrollHints } = useGalleryScroll(items.length);
  const hasItems = ready && items.length > 0;
  useGalleryExternalRefresh(refresh);
  useEffect(() => {
    refreshScrollHints();
  }, [items.length, loading, refreshScrollHints]);

  const activePreviewUrl = preview?.data?.previewUrl ?? null;

  const sectionClass = clsx(
    'relative mt-8 w-full max-w-[720px] mx-auto',
    (!hasItems && !loading) && 'pointer-events-none'
  );

  if (error) {
    return null;
  }

  if (!loading && !ready && !items.length) {
    return null;
  }

  return (
    <section className={sectionClass} aria-label="Gallery Quickview">
      <GalleryQuickviewHeader
        hasItems={hasItems}
        deleteMode={false}
        onRefresh={refresh}
        showDeleteControls={false}
      />

      {loading && !hasItems && <GallerySkeletonRow count={PLACEHOLDER_COUNT} />}

      {!loading && ready && !items.length && <GalleryEmptyState />}

      {hasItems && (
        <GalleryScrollContainer
          items={items}
          contentClassName="gap-4"
          listRef={listRef}
          showStartFade={showStartFade}
          showEndFade={showEndFade}
          onScroll={handleScroll}
          renderItem={(item) => {
            const isActive =
              currentStyleId === item.styleId &&
              (!activePreviewUrl || activePreviewUrl === item.displayUrl || activePreviewUrl === item.imageUrl);
            const isPending = pending?.id === item.id;
            return (
              <GalleryThumbnailCard
                key={item.id}
                item={item}
                isActive={isActive}
                isPending={Boolean(isPending)}
                highlight={highlightId === item.id}
                deleteMode={false}
                isMobileSurface={false}
                orientationLabel={ORIENTATION_LABEL[item.orientation]}
                showDeleteAction={false}
                onSelect={() => handleSelect(item)}
                onDeleteIntent={() => {}}
              />
            );
          }}
        />
      )}
    </section>
  );
};

const GalleryQuickviewModern = () => {
  const { items, loading, error, ready, requiresWatermark, refresh, removeItem } = useGalleryQuickview();
  const loadGalleryItem = useGalleryQuickviewSelection();
  const { currentStyleId, preview } = useStudioPreviewState();
  const { showToast } = useStudioExperienceContext();
  const { sessionAccessToken } = useStudioUserState();
  const openAuthModal = useAuthModal((state) => state.openModal);
  const { restoreOriginalImagePreview, resetPreviewToEmptyState, hasUpload } = useFounderStore((state) => ({
    restoreOriginalImagePreview: state.restoreOriginalImagePreview,
    resetPreviewToEmptyState: state.resetPreviewToEmptyState,
    hasUpload: Boolean(state.croppedImage || state.uploadedImage),
  }));
  const { surface, isMobileSurface, isCoarsePointer } = useGallerySurface();
  const hasItems = ready && items.length > 0;
  const { pending, highlightId, handleSelect } = useGallerySelection({
    items,
    ready,
    requiresWatermark,
    loadGalleryItem,
  });
  const { listRef, showStartFade, showEndFade, handleScroll, refreshScrollHints } = useGalleryScroll(items.length);
  useGalleryExternalRefresh(refresh);

  const {
    deleteMode,
    toggleDeleteMode,
    setDeleteModeWithTracking,
    confirmItem,
    deletingId,
    handleDeleteIntent,
    handleCloseModal,
    handleConfirmDelete,
  } = useGalleryDeleteQueue({
    hasItems,
    surface,
    hasUpload,
    sessionAccessToken,
    removeItem,
    showToast,
    openAuthModal,
    restoreOriginalImagePreview,
    resetPreviewToEmptyState,
  });

  const longPressRef = useRef<number | null>(null);

  useEffect(() => {
    refreshScrollHints();
  }, [items.length, loading, refreshScrollHints]);

  const activePreviewUrl = preview?.data?.previewUrl ?? null;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      deleteMode ||
      !hasItems ||
      !isMobileSurface ||
      !isCoarsePointer() ||
      (event.pointerType && event.pointerType !== 'touch')
    ) {
      return;
    }
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
    }
    longPressRef.current = window.setTimeout(() => {
      setDeleteModeWithTracking(true);
    }, 450);
  };

  const clearLongPress = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  useEffect(() => () => clearLongPress(), []);

  const sectionClass = clsx(
    'relative mt-8 w-full max-w-[720px] mx-auto',
    (!hasItems && !loading) && 'pointer-events-none'
  );

  if (error) {
    return null;
  }

  if (!loading && !ready && !items.length) {
    return null;
  }

  return (
    <section className={sectionClass} aria-label="Gallery Quickview">
      <GalleryQuickviewHeader
        hasItems={hasItems}
        deleteMode={deleteMode}
        onRefresh={refresh}
        onToggleDeleteMode={toggleDeleteMode}
      />

      {loading && !hasItems && <GallerySkeletonRow count={PLACEHOLDER_COUNT} />}

      {!loading && ready && !items.length && <GalleryEmptyState />}

      {hasItems && (
        <GalleryScrollContainer
          items={items}
          listRef={listRef}
          showStartFade={showStartFade}
          showEndFade={showEndFade}
          onScroll={handleScroll}
          renderItem={(item) => {
            const isActive =
              currentStyleId === item.styleId &&
              (!activePreviewUrl || activePreviewUrl === item.displayUrl || activePreviewUrl === item.imageUrl);
            const isPending = pending?.id === item.id;

            return (
              <GalleryThumbnailCard
                key={item.id}
                item={item}
                isActive={isActive}
                isPending={Boolean(isPending)}
                highlight={highlightId === item.id}
                deleteMode={deleteMode}
                isMobileSurface={isMobileSurface}
                orientationLabel={ORIENTATION_LABEL[item.orientation]}
                onSelect={() => handleSelect(item)}
                onDeleteIntent={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (isMobileSurface && !deleteMode) return;
                  handleDeleteIntent(item);
                }}
                onPointerDown={handlePointerDown}
                onPointerUp={clearLongPress}
                onPointerLeave={clearLongPress}
                onPointerCancel={clearLongPress}
              />
            );
          }}
        />
      )}

      <GalleryDeleteModal
        confirmItem={confirmItem}
        deletingId={deletingId}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
};

const GalleryQuickview = () => {
  if (!ENABLE_QUICKVIEW_DELETE_MODE) {
    return <GalleryQuickviewLegacy />;
  }

  return <GalleryQuickviewModern />;
};

export default GalleryQuickview;
