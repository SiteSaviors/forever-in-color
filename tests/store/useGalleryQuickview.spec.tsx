/**
 * @vitest-environment jsdom
 */
import React, { useEffect } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useGalleryQuickview } from '@/store/hooks/studio/useGalleryQuickview';
import { useFounderStore } from '@/store/useFounderStore';
import { fetchGalleryItems } from '@/utils/galleryApi';

vi.mock('@/utils/galleryApi', () => ({
  fetchGalleryItems: vi.fn(),
  saveToGallery: vi.fn(),
}));

const fetchGalleryItemsMock = vi.mocked(fetchGalleryItems);

const authenticateUser = () => {
  useFounderStore.setState({
    sessionUser: { id: 'user-1', email: 'user@example.com' },
    accessToken: 'token-123',
    isAuthenticated: true,
    sessionHydrated: true,
    galleryItems: [],
    galleryStatus: 'idle',
    galleryError: null,
    galleryRequiresWatermark: null,
    lastFetchedAt: null,
  });
};

const resetStore = () => {
  useFounderStore.setState({
    galleryItems: [],
    galleryStatus: 'idle',
    galleryError: null,
    galleryRequiresWatermark: null,
    lastFetchedAt: null,
  });
};

describe('useGalleryQuickview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
    authenticateUser();
  });

  afterEach(() => {
    resetStore();
  });

  const mockGalleryResponse = () => {
    fetchGalleryItemsMock.mockResolvedValue({
      items: [
        {
          id: 'item-1',
          userId: 'user-1',
          previewLogId: 'log-1',
          styleId: 'style-1',
          styleName: 'Watercolor Dreams',
          orientation: 'vertical',
          imageUrl: 'https://cdn.example.com/image.jpg',
          displayUrl: 'https://cdn.example.com/display.jpg',
          storagePath: 'preview-cache-public/path.jpg',
          thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
          thumbnailStoragePath: 'preview-cache-public/thumbnails/thumb.jpg',
          sourceStoragePath: 'user_uploads/user/photo.jpg',
          sourceDisplayUrl: 'https://cdn.example.com/source.jpg',
          cropConfig: { x: 0, y: 0, width: 100, height: 150 },
          isFavorited: false,
          isDeleted: false,
          downloadCount: 0,
          lastDownloadedAt: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
      limit: 15,
      offset: 0,
      requiresWatermark: false,
    });
  };

  const renderHook = async () => {
    const latest: { current: ReturnType<typeof useGalleryQuickview> | null } = { current: null };

    const Bridge = () => {
      const value = useGalleryQuickview();
      useEffect(() => {
        latest.current = value;
      }, [value]);
      return null;
    };

    let renderer: ReactTestRenderer;
    await act(async () => {
      renderer = create(<Bridge />);
      await Promise.resolve();
    });

    return { latest, renderer: renderer! };
  };

  it('fetches gallery items on mount', async () => {
    mockGalleryResponse();

    const { latest, renderer } = await renderHook();

    expect(fetchGalleryItemsMock).toHaveBeenCalledTimes(1);
    expect(fetchGalleryItemsMock).toHaveBeenCalledWith({ limit: 15, sort: 'newest' }, 'token-123');
    expect(latest.current?.items).toHaveLength(1);
    expect(latest.current?.items[0]).toMatchObject({
      id: 'item-1',
      orientation: 'vertical',
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      sourceStoragePath: 'user_uploads/user/photo.jpg',
    });
    expect(latest.current?.requiresWatermark).toBe(false);

    renderer.unmount();
  });

  it('allows manual refresh', async () => {
    mockGalleryResponse();
    const { latest, renderer } = await renderHook();
    expect(fetchGalleryItemsMock).toHaveBeenCalledTimes(1);

    fetchGalleryItemsMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 15,
      offset: 0,
      requiresWatermark: true,
    });

    await act(async () => {
      await latest.current?.refresh();
      await Promise.resolve();
    });

    expect(fetchGalleryItemsMock).toHaveBeenCalledTimes(2);
    expect(latest.current?.items).toHaveLength(0);
    expect(latest.current?.requiresWatermark).toBe(true);

    renderer.unmount();
  });

  it('records errors and clears items', async () => {
    fetchGalleryItemsMock.mockResolvedValue({
      error: 'Network issue',
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { latest, renderer } = await renderHook();

    expect(fetchGalleryItemsMock).toHaveBeenCalledTimes(1);
    expect(latest.current?.status).toBe('error');
    expect(latest.current?.items).toHaveLength(0);
    expect(latest.current?.error).toBe('Network issue');

    renderer.unmount();
    consoleErrorSpy.mockRestore();
  });
});
