/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useGalleryQuickviewSelection } from '@/store/hooks/studio/useGalleryQuickviewSelection';
import { useFounderStore } from '@/store/useFounderStore';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';

vi.mock('@/utils/galleryQuickviewTelemetry', () => ({
  trackGalleryQuickviewThumbnailClick: vi.fn(),
}));

vi.mock('@/utils/telemetry', () => ({
  emitStepOneEvent: vi.fn(),
}));

const originalImageCtor = global.Image;

const configureImageMock = (handlers: Record<string, { succeed: boolean; width: number; height: number }>) => {
  class MockImage {
    onload: (() => void) | null = null;
    onerror: ((err?: unknown) => void) | null = null;
    naturalWidth = 0;
    naturalHeight = 0;

    set src(value: string) {
      const handler = handlers[value];
      if (!handler || !handler.succeed) {
        queueMicrotask(() => this.onerror?.(new Error(`Failed to load: ${value}`)));
        return;
      }
      this.naturalWidth = handler.width;
      this.naturalHeight = handler.height;
      queueMicrotask(() => this.onload?.());
    }
  }

  (globalThis as unknown as { Image: typeof Image }).Image = MockImage as unknown as typeof Image;
};

const restoreImageMock = () => {
  (globalThis as unknown as { Image: typeof Image }).Image = originalImageCtor;
};

const baseItem = (): GalleryQuickviewItem => ({
  id: 'item-1',
  styleId: 'style-1',
  styleName: 'Golden Hour',
  orientation: 'square',
  thumbnailUrl: null,
  imageUrl: 'https://cdn.example.com/image.jpg',
  displayUrl: 'https://cdn.example.com/display.jpg',
  storagePath: 'preview-cache-public/path.jpg',
  previewLogId: 'log-1',
  sourceStoragePath: 'user-uploads/user/hash.jpg',
  sourceDisplayUrl: 'https://cdn.example.com/source.jpg',
  sourceSignedUrl: 'https://signed.example.com/source.jpg',
  sourceSignedUrlExpiresAt: Date.now() + 60_000,
  cropConfig: { x: 10, y: 12, width: 320, height: 320, imageWidth: 640, imageHeight: 640 },
  savedAt: new Date().toISOString(),
  position: 0,
});

describe('useGalleryQuickviewSelection', () => {
const baseStore = useFounderStore.getState();
const initialFns = {
  ensureStyleLoaded: baseStore.ensureStyleLoaded,
  setOrientation: baseStore.setOrientation,
  setSmartCropForOrientation: baseStore.setSmartCropForOrientation,
  setOriginalImage: baseStore.setOriginalImage,
  setOriginalImageDimensions: baseStore.setOriginalImageDimensions,
  setOriginalImageSource: baseStore.setOriginalImageSource,
  setCroppedImage: baseStore.setCroppedImage,
  setOrientationPreviewPending: baseStore.setOrientationPreviewPending,
  markCropReady: baseStore.markCropReady,
  setLaunchpadSlimMode: baseStore.setLaunchpadSlimMode,
  selectStyle: baseStore.selectStyle,
  setPendingStyle: baseStore.setPendingStyle,
  setStylePreviewState: baseStore.setStylePreviewState,
  setPreviewStatus: baseStore.setPreviewStatus,
  cacheStylePreview: baseStore.cacheStylePreview,
  setPreviewState: baseStore.setPreviewState,
};

type MockHandles = {
  ensureStyleLoaded: ReturnType<typeof vi.fn> & typeof initialFns.ensureStyleLoaded;
  setOrientation: ReturnType<typeof vi.fn>;
  setSmartCropForOrientation: ReturnType<typeof vi.fn>;
  setOriginalImage: ReturnType<typeof vi.fn>;
  setOriginalImageDimensions: ReturnType<typeof vi.fn>;
  setOriginalImageSource: ReturnType<typeof vi.fn>;
  setCroppedImage: ReturnType<typeof vi.fn>;
  setOrientationPreviewPending: ReturnType<typeof vi.fn>;
  markCropReady: ReturnType<typeof vi.fn>;
  setLaunchpadSlimMode: ReturnType<typeof vi.fn>;
  selectStyle: ReturnType<typeof vi.fn>;
  setPendingStyle: ReturnType<typeof vi.fn>;
  setStylePreviewState: ReturnType<typeof vi.fn>;
  setPreviewStatus: ReturnType<typeof vi.fn>;
  cacheStylePreview: ReturnType<typeof vi.fn>;
  setPreviewState: ReturnType<typeof vi.fn>;
};

let mocks: MockHandles;

  const mountHook = async () => {
    let select: ReturnType<typeof useGalleryQuickviewSelection> | null = null;

    const Bridge = () => {
      select = useGalleryQuickviewSelection();
      return null;
    };

    await act(async () => {
      create(<Bridge />);
      await Promise.resolve();
    });

    return select!;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    configureImageMock({
      'https://signed.example.com/source.jpg': { succeed: true, width: 800, height: 600 },
      'https://cdn.example.com/source.jpg': { succeed: true, width: 800, height: 600 },
      'https://cdn.example.com/display.jpg': { succeed: true, width: 512, height: 512 },
      'https://fallback.example.com/image.jpg': { succeed: true, width: 256, height: 256 },
    });

    mocks = {
      ensureStyleLoaded: vi.fn().mockResolvedValue(null) as unknown as MockHandles['ensureStyleLoaded'],
      setOrientation: vi.fn(),
      setSmartCropForOrientation: vi.fn(),
      setOriginalImage: vi.fn(),
      setOriginalImageDimensions: vi.fn(),
      setOriginalImageSource: vi.fn(),
      setCroppedImage: vi.fn(),
      setOrientationPreviewPending: vi.fn(),
      markCropReady: vi.fn(),
      setLaunchpadSlimMode: vi.fn(),
      selectStyle: vi.fn(),
      setPendingStyle: vi.fn(),
      setStylePreviewState: vi.fn(),
      setPreviewStatus: vi.fn(),
      cacheStylePreview: vi.fn(),
      setPreviewState: vi.fn(),
    };

    useFounderStore.setState({
      orientation: 'square',
      ensureStyleLoaded: mocks.ensureStyleLoaded,
      setOrientation: mocks.setOrientation,
      setSmartCropForOrientation: mocks.setSmartCropForOrientation,
      setOriginalImage: mocks.setOriginalImage,
      setOriginalImageDimensions: mocks.setOriginalImageDimensions,
      setOriginalImageSource: mocks.setOriginalImageSource,
      setCroppedImage: mocks.setCroppedImage,
      setOrientationPreviewPending: mocks.setOrientationPreviewPending,
      markCropReady: mocks.markCropReady,
      setLaunchpadSlimMode: mocks.setLaunchpadSlimMode,
      selectStyle: mocks.selectStyle,
      setPendingStyle: mocks.setPendingStyle,
      setStylePreviewState: mocks.setStylePreviewState,
      setPreviewStatus: mocks.setPreviewStatus,
      cacheStylePreview: mocks.cacheStylePreview,
      setPreviewState: mocks.setPreviewState,
    });
  });

  afterEach(() => {
    useFounderStore.setState(initialFns);
    mocks = undefined as unknown as MockHandles;
    restoreImageMock();
  });

  it('hydrates from a valid signed URL', async () => {
    const select = await mountHook();
    const item = baseItem();

    await act(async () => {
      await select(item, false, 0);
    });

    expect(mocks.ensureStyleLoaded).toHaveBeenCalledWith(item.styleId);
    expect(mocks.setOriginalImage).toHaveBeenCalledWith(item.sourceSignedUrl);
    expect(mocks.setOriginalImageSource).toHaveBeenCalledWith({
      storagePath: item.sourceStoragePath,
      publicUrl: item.sourceDisplayUrl,
      signedUrl: item.sourceSignedUrl,
      signedUrlExpiresAt: item.sourceSignedUrlExpiresAt,
      hash: null,
      bytes: null,
    });
    expect(mocks.setSmartCropForOrientation).toHaveBeenCalledWith('square', expect.objectContaining({
      dataUrl: item.sourceSignedUrl,
      imageDimensions: { width: 640, height: 640 },
    }));
  });

  it('switches orientation when gallery item differs', async () => {
    useFounderStore.setState({ orientation: 'horizontal' });
    const select = await mountHook();
    const item = { ...baseItem(), orientation: 'vertical' as const };

    await act(async () => {
      await select(item, true, 2);
    });

    expect(mocks.setOrientation).toHaveBeenCalledWith('vertical');
  });

  it('falls back to display URL when signed URL invalid', async () => {
    configureImageMock({
      'https://cdn.example.com/source.jpg': { succeed: true, width: 720, height: 540 },
      'https://cdn.example.com/display.jpg': { succeed: true, width: 720, height: 540 },
    });

    const select = await mountHook();
    const staleItem = {
      ...baseItem(),
      sourceSignedUrlExpiresAt: Date.now() - 1,
    };

    await act(async () => {
      await select(staleItem, null, 3);
    });

    expect(mocks.setOriginalImage).toHaveBeenCalledWith(staleItem.sourceDisplayUrl);
    expect(mocks.setOriginalImageSource).toHaveBeenCalledWith({
      storagePath: staleItem.sourceStoragePath,
      publicUrl: staleItem.sourceDisplayUrl,
      signedUrl: null,
      signedUrlExpiresAt: null,
      hash: null,
      bytes: null,
    });
  });

  it('gracefully falls back to preview when all sources fail', async () => {
    configureImageMock({
      'https://signed.example.com/source.jpg': { succeed: false, width: 0, height: 0 },
      'https://cdn.example.com/source.jpg': { succeed: false, width: 0, height: 0 },
      'https://cdn.example.com/display.jpg': { succeed: true, width: 512, height: 512 },
    });

    const select = await mountHook();
    const problematicItem = {
      ...baseItem(),
      sourceDisplayUrl: 'https://broken.example.com/source.jpg',
    };

    await act(async () => {
      await select(problematicItem, false, 4);
    });

    expect(mocks.setOriginalImage).toHaveBeenCalledWith(problematicItem.displayUrl);
    expect(mocks.setCroppedImage).toHaveBeenCalledWith(problematicItem.displayUrl);
  });
});
