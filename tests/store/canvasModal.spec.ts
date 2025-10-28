import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useFounderStore } from '@/store/useFounderStore';
import {
  registerStudioV2AnalyticsListener,
  type StudioV2Event,
} from '@/utils/studioV2Analytics';

const captureEvents = () => {
  const events: StudioV2Event[] = [];
  const unregister = registerStudioV2AnalyticsListener((event) => {
    events.push(event);
  });
  return { events, unregister };
};

describe('canvas modal store plumbing', () => {
  let unregister: (() => void) | undefined;
  let originalEnhancements = useFounderStore.getState().enhancements.map((item) => ({ ...item }));
  let previousSelectedStyleId: string | null;

  beforeEach(() => {
    originalEnhancements = useFounderStore
      .getState()
      .enhancements.map((item) => ({ ...item }));
    const state = useFounderStore.getState();
    previousSelectedStyleId = state.selectedStyleId;
    const defaultStyleId = state.selectedStyleId ?? state.styles[0]?.id ?? null;

    if (!defaultStyleId) {
      throw new Error('Founder store styles not initialized for canvas modal test');
    }

    useFounderStore.setState({
      croppedImage: 'data:image/png;base64,test',
      canvasModalOpen: false,
      canvasModalSource: null,
      canvasModalOpenedAt: null,
      selectedCanvasSize: null,
      selectedFrame: 'none',
      selectedStyleId: defaultStyleId,
      enhancements: originalEnhancements.map((item) => ({ ...item, enabled: false })),
    });
  });

  afterEach(() => {
    unregister?.();
    useFounderStore.setState({
      croppedImage: null,
      canvasModalOpen: false,
      canvasModalSource: null,
      canvasModalOpenedAt: null,
      enhancements: originalEnhancements,
      selectedCanvasSize: null,
      selectedFrame: 'none',
      selectedStyleId: previousSelectedStyleId ?? null,
    });
  });

  it('emits analytics when opening and closing', () => {
    const { events, unregister: stopCapture } = captureEvents();
    unregister = stopCapture;

    const state = useFounderStore.getState();
    state.openCanvasModal('center');

    expect(useFounderStore.getState().canvasModalOpen).toBe(true);
    const openEvent = events.find((event) => event.event === 'v2_canvas_modal_open');
    expect(openEvent).toBeDefined();
    expect(openEvent?.payload.sourceCTA).toBe('center');

    state.closeCanvasModal('dismiss');
    expect(useFounderStore.getState().canvasModalOpen).toBe(false);
    const closeEvent = events.find((event) => event.event === 'v2_canvas_modal_close');
    expect(closeEvent).toBeDefined();
    expect(closeEvent?.payload.reason).toBe('dismiss');
  });
});
