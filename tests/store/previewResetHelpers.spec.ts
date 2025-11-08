import { beforeEach, describe, expect, it } from 'vitest';
import { useFounderStore } from '@/store/useFounderStore';
import type { SmartCropResult } from '@/utils/smartCrop';

const resetPreviewState = () => {
  const store = useFounderStore.getState();
  store.setPreviewState('original-image', { status: 'idle' });
  useFounderStore.setState({
    croppedImage: null,
    uploadedImage: null,
    selectedStyleId: null,
    pendingStyleId: null,
    previewStatus: 'idle',
    stylePreviewStatus: 'idle',
    stylePreviewMessage: null,
    stylePreviewError: null,
    stylePreviewStartAt: null,
    orientationPreviewPending: false,
    smartCrops: {},
    launchpadSlimMode: false,
  });
};

describe('preview reset helpers', () => {
  beforeEach(() => {
    resetPreviewState();
  });

  it('restores the original-image preview when a base photo exists', () => {
    const store = useFounderStore.getState();
    useFounderStore.setState({
      originalImage: 'data:image/png;base64,ORIGINAL',
      croppedImage: 'data:image/png;base64,AAA',
      uploadedImage: null,
      selectedStyleId: 'style-watercolor',
    });

    store.setPreviewState('style-watercolor', {
      status: 'ready',
      data: {
        previewUrl: 'https://example.com/generated.jpg',
        watermarkApplied: false,
        startedAt: 1,
        completedAt: 2,
      },
      orientation: 'square',
    });

    const result = store.restoreOriginalImagePreview('style-watercolor');
    expect(result).toBe(true);

    const state = useFounderStore.getState();
    expect(state.selectedStyleId).toBe('original-image');
    expect(state.previewStatus).toBe('ready');
    expect(state.previews['style-watercolor'].status).toBe('idle');
    expect(state.previews['original-image'].status).toBe('ready');
    expect(state.previews['original-image'].data?.previewUrl).toBe('data:image/png;base64,ORIGINAL');
  });

  it('falls back to cropped image when original image missing', () => {
    const store = useFounderStore.getState();
    useFounderStore.setState({
      originalImage: null,
      croppedImage: 'data:image/png;base64,CROPONLY',
      uploadedImage: null,
      selectedStyleId: 'style-watercolor',
    });

    store.setPreviewState('style-watercolor', {
      status: 'ready',
      data: {
        previewUrl: 'https://example.com/generated.jpg',
        watermarkApplied: false,
        startedAt: 1,
        completedAt: 2,
      },
      orientation: 'square',
    });

    const result = store.restoreOriginalImagePreview('style-watercolor');
    expect(result).toBe(true);
    expect(useFounderStore.getState().previews['original-image'].data?.previewUrl).toBe('data:image/png;base64,CROPONLY');
  });

  it('returns false when no uploaded or cropped image is available', () => {
    const store = useFounderStore.getState();
    useFounderStore.setState({
      croppedImage: null,
      uploadedImage: null,
      selectedStyleId: 'style-watercolor',
    });

    const result = store.restoreOriginalImagePreview('style-watercolor');
    expect(result).toBe(false);
    expect(useFounderStore.getState().selectedStyleId).toBe('style-watercolor');
  });

  it('clears preview state to the pre-upload baseline when no photo exists', () => {
    const store = useFounderStore.getState();
    const smartCrop: SmartCropResult = {
      orientation: 'square',
      dataUrl: 'data:image/png;base64,CROP',
      region: { x: 0, y: 0, width: 100, height: 100 },
      imageDimensions: { width: 100, height: 100 },
      generatedAt: Date.now(),
      generatedBy: 'manual',
    };

    useFounderStore.setState({
      selectedStyleId: 'style-watercolor',
      previewStatus: 'ready',
      stylePreviewStatus: 'ready',
      smartCrops: { square: smartCrop },
      originalImage: 'data:image/png;base64,ORIGINAL',
      croppedImage: null,
      uploadedImage: null,
    });

    store.setPreviewState('style-watercolor', {
      status: 'ready',
      data: {
        previewUrl: 'https://example.com/generated.jpg',
        watermarkApplied: false,
        startedAt: 1,
        completedAt: 2,
      },
      orientation: 'square',
    });

    store.resetPreviewToEmptyState('style-watercolor');

    const state = useFounderStore.getState();
    expect(state.selectedStyleId).toBeNull();
    expect(state.previewStatus).toBe('idle');
    expect(state.stylePreviewStatus).toBe('idle');
    expect(state.previews['style-watercolor'].status).toBe('idle');
    expect(state.smartCrops).toEqual({});
    expect(state.originalImage).toBeNull();
    expect(state.croppedImage).toBeNull();
  });
});
