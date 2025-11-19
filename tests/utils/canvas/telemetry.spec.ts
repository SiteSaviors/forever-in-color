import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/telemetry', () => ({
  trackCanvasPanelOpen: vi.fn(),
}));

vi.mock('@/utils/studioV2Analytics', () => ({
  trackStudioV2CanvasModalOpen: vi.fn(),
  trackStudioV2CanvasModalClose: vi.fn(),
}));

import { emitCanvasModalClose, emitCanvasModalOpen, emitCanvasPanelOpen } from '@/utils/canvas/telemetry';
import { trackCanvasPanelOpen } from '@/utils/telemetry';
import { trackStudioV2CanvasModalOpen, trackStudioV2CanvasModalClose } from '@/utils/studioV2Analytics';

describe('canvas telemetry wrappers', () => {
  it('forwards panel open events', () => {
    emitCanvasPanelOpen('plus');
    expect(trackCanvasPanelOpen).toHaveBeenCalledWith('plus');
  });

  it('forwards modal open events', () => {
    const payload = {
      styleId: 'abc',
      sourceCTA: 'center',
      canvasSize: '24x24',
      frame: 'black',
      enhancements: [],
      orientation: 'square',
    };
    emitCanvasModalOpen(payload);
    expect(trackStudioV2CanvasModalOpen).toHaveBeenCalledWith(payload);
  });

  it('forwards modal close events', () => {
    const payload = {
      styleId: 'abc',
      reason: 'dismiss',
      timeSpentMs: 1000,
      configuredItems: {
        canvasSize: '24x24',
        frame: 'black',
        enhancements: [],
        orientation: 'square',
      },
    };
    emitCanvasModalClose(payload);
    expect(trackStudioV2CanvasModalClose).toHaveBeenCalledWith(payload);
  });
});
