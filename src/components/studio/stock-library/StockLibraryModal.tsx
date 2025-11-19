/**
 * Stock Library Modal
 *
 * Premium modal experience for browsing curated stock images.
 * Two-screen flow: Category Selector → Grid Browser
 *
 * Design: Glassmorphism overlay, full viewport, premium transitions
 */

import { useEffect, useCallback, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronLeft } from 'lucide-react';
import { useFounderStore } from '@/store/useFounderStore';
import { useStockLibraryModal, useStockLibraryPagination, useStockSelection } from '@/store/hooks/useStockLibraryStore';
import { trackStockModalOpened } from '@/utils/stockLibraryTelemetry';
import StockCategorySelector from './StockCategorySelector';
import StockSearchField from './StockSearchField';
import StockFilterPopover from './StockFilterPopover';
import StockLibrarySkeleton from './StockLibrarySkeleton';
import StockGridBrowser from './StockGridBrowser';

type CloseReason = 'dismiss' | 'upload_own' | 'esc_key' | 'backdrop';

const StockLibraryModal = () => {
  const { stockLibraryModalOpen, currentView, closeStockLibraryWithReason, setView } = useStockLibraryModal();
  const { stockStatus } = useStockLibraryPagination();
  const { appliedStockImageId, continueWithStockImage } = useStockSelection();
  const uploadedImage = useFounderStore((state) => state.uploadedImage);

  const wasOpenRef = useRef(false);

  // Track modal open
  useEffect(() => {
    if (stockLibraryModalOpen && !wasOpenRef.current) {
      trackStockModalOpened({
        source: 'empty_state', // Will be dynamic based on trigger
        hasUpload: !!uploadedImage,
      });
    }
    wasOpenRef.current = stockLibraryModalOpen;
  }, [stockLibraryModalOpen, uploadedImage]);

  // Handle close with telemetry
  const handleClose = useCallback(
    (reason: CloseReason = 'dismiss') => {
      closeStockLibraryWithReason(reason);
    },
    [closeStockLibraryWithReason]
  );

  // Handle ESC key
  const handleEscapeKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      handleClose('esc_key');
    },
    [handleClose]
  );

  // Handle back to categories
  const handleBackToCategories = useCallback(() => {
    setView('category-selector');
  }, [setView]);

  return (
    <Dialog.Root
      open={stockLibraryModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose('dismiss');
        }
      }}
    >
      <Dialog.Portal>
        {/* Backdrop overlay with glassmorphism */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onPointerDown={(event) => {
            if (event.button === 0) {
              event.preventDefault();
              handleClose('backdrop');
            }
          }}
        />

        {/* Modal content */}
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-[60] flex h-[90vh] w-[90vw] max-w-[1400px] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.22),transparent_65%)] shadow-2xl backdrop-blur-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] md:h-[85vh]"
          onEscapeKeyDown={handleEscapeKeyDown as never}
        >
          {/* Header with search and close */}
          <div className="border-b border-white/5">
            <div className="relative flex items-center justify-center px-8 py-6">
              {/* Back to categories button (only visible in grid browser) */}
              {currentView === 'grid-browser' && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={handleBackToCategories}
                    className="group relative rounded-full bg-gradient-to-r from-purple-500/40 via-fuchsia-500/40 to-indigo-500/40 p-[1px] shadow-[0_4px_20px_rgba(168,85,247,0.2)] transition-all duration-300 hover:from-purple-500/60 hover:via-fuchsia-500/60 hover:to-indigo-500/60 hover:shadow-[0_6px_28px_rgba(168,85,247,0.35)] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-95"
                  >
                    <span className="flex items-center gap-2.5 rounded-full bg-slate-950/90 px-5 py-2.5 backdrop-blur-md transition-all duration-300 group-hover:bg-slate-900/95">
                      <ChevronLeft className="h-4 w-4 text-purple-300 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-purple-200" />
                      <span
                        className="text-sm font-semibold tracking-wide text-white/90 transition-colors duration-300 group-hover:text-white"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        Back to categories
                      </span>
                    </span>
                  </button>
                </div>
              )}

              {/* Search field with integrated filter button */}
              <div className="relative flex items-center justify-center">
                <StockSearchField />
                {/* Filter button positioned at right edge of search bar */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <StockFilterPopover />
                </div>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => handleClose('dismiss')}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label="Close stock library"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content area (scrollable) */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {currentView === 'category-selector' && (
              stockStatus === 'loading' ? (
                <StockLibrarySkeleton variant="category-selector" />
              ) : (
                <StockCategorySelector />
              )
            )}
            {currentView === 'grid-browser' && <StockGridBrowser />}
          </div>

          {/* Footer CTA (always visible, disabled until image applied) */}
          <div className="flex flex-col items-center gap-4 border-t border-white/5 px-8 py-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => handleClose('upload_own')}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-12 py-4 text-base font-semibold tracking-tight text-white shadow-[0_12px_30px_rgba(168,85,247,0.45)] transition duration-200 hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(168,85,247,0.55)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 focus:ring-offset-slate-950"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Upload My Own Photo
            </button>

            <button
              type="button"
              disabled={!appliedStockImageId}
              onClick={continueWithStockImage}
              className={`rounded-full px-12 py-4 text-base font-semibold tracking-tight shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                appliedStockImageId
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white hover:from-green-600 hover:to-emerald-500 hover:shadow-[0_12px_30px_rgba(34,197,94,0.4)] focus:ring-green-400/70 cursor-pointer'
                  : 'bg-white/10 text-white/40 cursor-not-allowed focus:ring-white/20'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Continue With Image
            </button>
          </div>

          {/* Screen reader announcements */}
          <Dialog.Title className="sr-only">Browse Stock Library</Dialog.Title>
          <Dialog.Description className="sr-only">
            Select a curated stock image to use in your Wondertone creation
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default StockLibraryModal;
