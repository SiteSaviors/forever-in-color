/**
 * @vitest-environment jsdom
 */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useFounderStore } from '@/store/useFounderStore';
import * as telemetry from '@/utils/telemetry';

type FounderStateSnapshot = ReturnType<typeof useFounderStore.getState>;

describe('openCanvasModal telemetry', () => {
  const canvasPanelSpy = vi.spyOn(telemetry, 'trackCanvasPanelOpen').mockImplementation(() => {});

  let previousState: {
    croppedImage: string | null;
    selectedStyleId: string | null | undefined;
    entitlements: FounderStateSnapshot['entitlements'];
    canvasModalOpen: boolean;
    canvasModalSource: FounderStateSnapshot['canvasModalSource'];
    canvasModalOpenedAt: number | null;
  };

  beforeEach(() => {
    const snapshot = useFounderStore.getState();
    previousState = {
      croppedImage: snapshot.croppedImage ?? null,
      selectedStyleId: snapshot.selectedStyleId,
      entitlements: snapshot.entitlements ? { ...snapshot.entitlements } : undefined,
      canvasModalOpen: snapshot.canvasModalOpen,
      canvasModalSource: snapshot.canvasModalSource,
      canvasModalOpenedAt: snapshot.canvasModalOpenedAt,
    };
    canvasPanelSpy.mockClear();
  });

  afterEach(() => {
    const { croppedImage, selectedStyleId, entitlements, canvasModalOpen, canvasModalSource, canvasModalOpenedAt } =
      previousState;
    useFounderStore.setState({
      croppedImage,
      selectedStyleId: selectedStyleId ?? null,
      entitlements,
      canvasModalOpen,
      canvasModalSource,
      canvasModalOpenedAt,
    });
  });

  it('emits trackCanvasPanelOpen when modal opens', () => {
    const store = useFounderStore.getState();
    const styleId = store.styles[0]?.id ?? 'style-1';
    useFounderStore.setState({
      croppedImage: 'data:image/png;base64,example',
      selectedStyleId: styleId,
      entitlements: {
        status: 'ready',
        tier: 'premium',
        quota: 10,
        remainingTokens: 5,
        requiresWatermark: false,
        priority: 'normal',
        renewAt: null,
        lastSyncedAt: Date.now(),
        error: null,
      },
    });

    useFounderStore.getState().openCanvasModal('center');

    expect(canvasPanelSpy).toHaveBeenCalledTimes(1);
    expect(canvasPanelSpy).toHaveBeenCalledWith('premium');
  });

  it('does not emit when prerequisites are missing', () => {
    useFounderStore.setState({
      croppedImage: null,
    });

    useFounderStore.getState().openCanvasModal('center');

    expect(canvasPanelSpy).not.toHaveBeenCalled();
  });
});
