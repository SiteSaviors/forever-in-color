import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useToneSections } from '@/store/hooks/useToneSections';
import { useFounderStore } from '@/store/useFounderStore';

const getSampleStyleId = () => {
  const state = useFounderStore.getState();
  const style = state.styles.find((item) => item.id !== 'original-image');
  if (!style) {
    throw new Error('Expected a non original-image style for readiness tests');
  }
  return style.id;
};

describe('useToneSections readiness propagation', () => {
  let testRenderer: renderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    useFounderStore.getState().resetPreviews();
    useFounderStore.setState({
      pendingStyleId: null,
      orientationPreviewPending: false,
    });
  });

  afterEach(() => {
    testRenderer?.unmount();
    testRenderer = null;
  });

  it('exposes readiness metadata for tone styles', () => {
    const styleId = getSampleStyleId();
    const orientation = useFounderStore.getState().orientation;
    let capturedHasPreview: boolean | null = null;
    let capturedSource: string | null = null;

    const TestComponent = () => {
      const { sections } = useToneSections();
      const flattened = sections.flatMap((section) => section.styles);
      const target = flattened.find((entry) => entry.option.id === styleId);
      if (target) {
        capturedHasPreview = target.readiness.hasPreview;
        capturedSource = target.readiness.source;
      }
      return null;
    };

    act(() => {
      testRenderer = renderer.create(<TestComponent />);
    });

    expect(capturedHasPreview).toBe(false);
    expect(capturedSource).toBeNull();

    act(() => {
      useFounderStore.setState((state) => ({
        previews: {
          ...state.previews,
          [styleId]: {
            status: 'ready',
            data: {
              previewUrl: 'https://cdn.example.com/preview.jpg',
              watermarkApplied: false,
              startedAt: Date.now() - 100,
              completedAt: Date.now(),
              storageUrl: null,
              storagePath: null,
              sourceStoragePath: null,
              sourceDisplayUrl: null,
              previewLogId: null,
              cropConfig: null,
            },
            orientation,
          },
        },
      }));
    });

    expect(capturedHasPreview).toBe(true);
    expect(capturedSource).toBe('live');
  });

  it('flags regenerating orientation states in readiness', () => {
    const styleId = getSampleStyleId();
    const orientation = useFounderStore.getState().orientation;
    let capturedRegenerating: boolean | null = null;
    let capturedOrientationPending: boolean | null = null;
    let capturedOrientationMatches: boolean | null = null;

    const TestComponent = () => {
      const { sections } = useToneSections();
      const flattened = sections.flatMap((section) => section.styles);
      const target = flattened.find((entry) => entry.option.id === styleId);
      if (target) {
        capturedRegenerating = target.readiness.isRegenerating;
        capturedOrientationPending = target.readiness.isOrientationPending;
        capturedOrientationMatches = target.readiness.orientationMatches;
      }
      return null;
    };

    act(() => {
      testRenderer = renderer.create(<TestComponent />);
    });

    expect(capturedRegenerating).toBe(false);
    expect(capturedOrientationPending).toBe(false);

    act(() => {
      useFounderStore.setState((state) => ({
        previews: {
          ...state.previews,
          [styleId]: {
            status: 'ready',
            data: {
              previewUrl: 'https://cdn.example.com/preview.jpg',
              watermarkApplied: false,
              startedAt: Date.now() - 100,
              completedAt: Date.now(),
              storageUrl: null,
              storagePath: null,
              sourceStoragePath: null,
              sourceDisplayUrl: null,
              previewLogId: null,
              cropConfig: null,
            },
            orientation,
          },
        },
      }));
    });

    expect(capturedRegenerating).toBe(false);
    expect(capturedOrientationPending).toBe(false);

    act(() => {
      useFounderStore.setState({
        orientation: 'vertical',
        pendingStyleId: styleId,
        orientationPreviewPending: true,
      });
    });

    expect(capturedRegenerating).toBe(true);
    expect(capturedOrientationPending).toBe(true);
    expect(capturedOrientationMatches).toBe(false);
  });
});
