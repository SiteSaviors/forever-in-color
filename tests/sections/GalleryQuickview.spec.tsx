/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GalleryQuickview from '@/sections/studio/experience/GalleryQuickview';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import * as telemetry from '@/utils/galleryQuickviewTelemetry';

const mockItem = (overrides: Partial<GalleryQuickviewItem> = {}): GalleryQuickviewItem => ({
  id: 'item-1',
  styleId: 'style-1',
  styleName: 'Liquid Chrome',
  orientation: 'square',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  imageUrl: 'https://example.com/image.jpg',
  displayUrl: 'https://example.com/display.jpg',
  storagePath: 'path/to/storage',
  previewLogId: 'preview-log-id',
  sourceStoragePath: null,
  sourceDisplayUrl: null,
  sourceSignedUrl: null,
  sourceSignedUrlExpiresAt: null,
  cropConfig: null,
  savedAt: '2024-01-01T00:00:00.000Z',
  position: 0,
  ...overrides,
});

const galleryHookMock = vi.fn();
const loadItemMock = vi.fn();
const deleteGalleryItemMock = vi.fn();
const deletePreviewCacheEntriesMock = vi.fn();
const showToastMock = vi.fn();
const openAuthModalMock = vi.fn();
const restoreOriginalImagePreviewMock = vi.fn();
const resetPreviewToEmptyStateMock = vi.fn();
const removeItemMock = vi.fn();
const useStudioUserStateMock = vi.fn(() => ({ sessionAccessToken: 'access-token', isAuthenticated: true }));

const founderStoreState = {
  croppedImage: 'data:image/png;base64,crop',
  uploadedImage: null as string | null,
  restoreOriginalImagePreview: restoreOriginalImagePreviewMock,
  resetPreviewToEmptyState: resetPreviewToEmptyStateMock,
};

vi.mock('@/config/featureFlags', () => ({
  ENABLE_QUICKVIEW_DELETE_MODE: true,
}));

vi.mock('@/store/hooks/studio', () => ({
  useGalleryQuickview: () => galleryHookMock(),
  useGalleryQuickviewSelection: () => loadItemMock,
  useStudioPreviewState: () => ({
    currentStyleId: null,
    preview: null,
  }),
}));

vi.mock('@/store/hooks/studio/useStudioUserState', () => ({
  useStudioUserState: () => useStudioUserStateMock(),
}));

vi.mock('@/sections/studio/experience/context', () => ({
  useStudioExperienceContext: () => ({
    showToast: showToastMock,
    showUpgradeModal: vi.fn(),
    renderFeedback: vi.fn(),
  }),
}));

vi.mock('@/store/previewCacheStore', () => ({
  deletePreviewCacheEntries: (...args: unknown[]) => deletePreviewCacheEntriesMock(...args),
}));

vi.mock('@/utils/galleryApi', () => ({
  deleteGalleryItem: (...args: unknown[]) => deleteGalleryItemMock(...args),
}));

vi.mock('@/store/useAuthModal', () => ({
  useAuthModal: (selector: (state: { openModal: typeof openAuthModalMock }) => unknown) =>
    selector({ openModal: openAuthModalMock }),
}));

vi.mock('@/store/useFounderStore', () => {
  const useFounderStore = (selector: (state: typeof founderStoreState) => unknown) =>
    selector(founderStoreState);
  useFounderStore.getState = () => founderStoreState;
  return { useFounderStore };
});

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

const mediaQueryState = {
  mobile: false,
  coarse: false,
};

const installMatchMediaMock = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      let matches = false;
      if (query.includes('max-width: 1023px')) {
        matches = mediaQueryState.mobile;
      } else if (query.includes('pointer: coarse')) {
        matches = mediaQueryState.coarse;
      }
      return {
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });
};

const deleteModeSpy = vi.spyOn(telemetry, 'trackGalleryQuickviewDeleteModeChanged');
const deleteRequestedSpy = vi.spyOn(telemetry, 'trackGalleryQuickviewDeleteRequested');
const deleteResultSpy = vi.spyOn(telemetry, 'trackGalleryQuickviewDeleteResult');

const renderComponent = () => render(<GalleryQuickview />);

if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    width: number;
    height: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, props: PointerEventInit = {}) {
      super(type, props);
      this.pointerId = props.pointerId ?? 1;
      this.width = props.width ?? 1;
      this.height = props.height ?? 1;
      this.pressure = props.pressure ?? 0;
      this.tangentialPressure = props.tangentialPressure ?? 0;
      this.tiltX = props.tiltX ?? 0;
      this.tiltY = props.tiltY ?? 0;
      this.twist = props.twist ?? 0;
      this.pointerType = props.pointerType ?? 'mouse';
      this.isPrimary = props.isPrimary ?? true;
    }
  }
  window.PointerEvent = PointerEventPolyfill as typeof window.PointerEvent;
  (globalThis as unknown as { PointerEvent: typeof window.PointerEvent }).PointerEvent = window.PointerEvent;
}

describe('GalleryQuickview (flag-enabled UI)', () => {
  beforeEach(() => {
    mediaQueryState.mobile = false;
    mediaQueryState.coarse = false;
    installMatchMediaMock();
    useStudioUserStateMock.mockReturnValue({ sessionAccessToken: 'access-token', isAuthenticated: true });
    galleryHookMock.mockReturnValue({
      items: [mockItem()],
      status: 'ready',
      loading: false,
      ready: true,
      error: null,
      requiresWatermark: false,
      refresh: vi.fn(),
      invalidate: vi.fn(),
      removeItem: removeItemMock,
    });
    loadItemMock.mockReset();
    loadItemMock.mockResolvedValue(undefined);
    deleteGalleryItemMock.mockReset();
    deletePreviewCacheEntriesMock.mockReset();
    showToastMock.mockReset();
    openAuthModalMock.mockReset();
    restoreOriginalImagePreviewMock.mockReset();
    resetPreviewToEmptyStateMock.mockReset();
    removeItemMock.mockReset();
    restoreOriginalImagePreviewMock.mockReturnValue(true);
    founderStoreState.croppedImage = 'data:image/png;base64,crop';
    founderStoreState.uploadedImage = null;
    deleteModeSpy.mockReset();
    deleteRequestedSpy.mockReset();
    deleteResultSpy.mockReset();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(max-width: 1023px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const enterDeleteMode = () => {
    const manageButton = screen.getByRole('button', { name: /manage/i });
    fireEvent.click(manageButton);
  };

  const openDeleteModal = () => {
    enterDeleteMode();
    fireEvent.click(screen.getByLabelText(/Delete saved art/i));
  };

  it('exposes the toolbar and toggles delete mode state', () => {
    renderComponent();
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Delete mode off');
    enterDeleteMode();
    expect(screen.getByRole('status')).toHaveTextContent('Delete mode on');
    expect(deleteModeSpy).toHaveBeenCalledWith({ active: true, surface: 'desktop' });
  });

  it('keeps mobile delete buttons inert until delete mode is enabled', () => {
    mediaQueryState.mobile = true;
    installMatchMediaMock();
    renderComponent();
    const deleteButton = screen.getByLabelText(/Delete saved art/i);
    expect(deleteButton).toHaveAttribute('aria-hidden', 'true');
    enterDeleteMode();
    expect(deleteButton).toHaveAttribute('aria-hidden', 'false');
  });

  it('allows desktop delete without toggling manage', () => {
    renderComponent();
    const deleteButton = screen.getByLabelText(/Delete saved art/i);
    fireEvent.click(deleteButton);
    expect(screen.getByText(/Delete “Liquid Chrome”/i)).toBeInTheDocument();
  });

  it('opens the confirmation modal when delete intent fires', () => {
    renderComponent();
    openDeleteModal();
    expect(screen.getByText(/Delete “Liquid Chrome”/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Keep preview/i }));
    expect(screen.queryByText(/Delete “Liquid Chrome”/i)).not.toBeInTheDocument();
  });

  it('continues to load previews when the card button is pressed', async () => {
    renderComponent();
    const loadButton = screen.getByRole('button', { name: /Load saved art "Liquid Chrome"/i });
    await act(async () => {
      fireEvent.click(loadButton);
    });
    expect(loadItemMock).toHaveBeenCalledTimes(1);
  });

  it('deletes a gallery item and emits telemetry when confirmed', async () => {
    deleteGalleryItemMock.mockResolvedValue({ success: true, status: 200 });
    renderComponent();
    openDeleteModal();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Delete preview/i }));
    });

    await waitFor(() => expect(deleteGalleryItemMock).toHaveBeenCalledWith('item-1', 'access-token'));
    expect(removeItemMock).toHaveBeenCalledWith('item-1');
    expect(deletePreviewCacheEntriesMock).toHaveBeenCalledWith('style-1');
    expect(restoreOriginalImagePreviewMock).toHaveBeenCalledWith('style-1');
    expect(resetPreviewToEmptyStateMock).not.toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Removed from gallery', variant: 'success' })
    );
    expect(deleteRequestedSpy).toHaveBeenCalledWith(
      expect.objectContaining({ artId: 'item-1', styleId: 'style-1', hasUpload: true })
    );
    expect(deleteResultSpy).toHaveBeenCalledWith(
      expect.objectContaining({ artId: 'item-1', styleId: 'style-1', success: true })
    );
  });

  it('falls back to original empty state when no upload is available', async () => {
    founderStoreState.croppedImage = null;
    founderStoreState.uploadedImage = null;
    restoreOriginalImagePreviewMock.mockReturnValue(false);
    deleteGalleryItemMock.mockResolvedValue({ success: true, status: 200 });

    renderComponent();
    openDeleteModal();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Delete preview/i }));
    });

    await waitFor(() => expect(deleteGalleryItemMock).toHaveBeenCalled());
    expect(resetPreviewToEmptyStateMock).toHaveBeenCalledWith('style-1');
  });

  it('opens the auth modal and shows error toast on 401 responses', async () => {
    deleteGalleryItemMock.mockResolvedValue({
      success: false,
      error: 'Authentication required',
      status: 401,
    });

    renderComponent();
    openDeleteModal();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Delete preview/i }));
    });

    await waitFor(() => expect(deleteGalleryItemMock).toHaveBeenCalled());
    expect(openAuthModalMock).toHaveBeenCalledWith('signin', { source: 'gallery-quickview' });
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Delete failed', variant: 'error' })
    );
    expect(deleteResultSpy).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, errorCode: 'auth' })
    );
    expect(removeItemMock).not.toHaveBeenCalled();
  });

  it('prompts auth immediately when no session token is available', async () => {
    useStudioUserStateMock.mockReturnValue({ sessionAccessToken: null, isAuthenticated: true });
    renderComponent();
    openDeleteModal();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Delete preview/i }));
    });
    expect(deleteGalleryItemMock).not.toHaveBeenCalled();
    expect(openAuthModalMock).toHaveBeenCalledWith('signin', { source: 'gallery-quickview' });
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Delete failed', description: 'Please sign in to manage your gallery.' })
    );
    expect(deleteResultSpy).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, errorCode: 'auth' })
    );
  });

  it('shows offline message when navigator reports offline state', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => false,
    });
    renderComponent();
    openDeleteModal();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Delete preview/i }));
    });
    expect(deleteGalleryItemMock).not.toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'You appear to be offline. Reconnect and try again.' })
    );
    expect(deleteResultSpy).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, errorCode: 'network' })
    );
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => true,
    });
  });

  it('applies wiggle animation class when delete mode is active on mobile', () => {
    mediaQueryState.mobile = true;
    installMatchMediaMock();
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    expect(document.querySelector('.quickview-card-wiggle')).toBeInTheDocument();
  });
});
