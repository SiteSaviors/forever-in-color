import { trackCanvasPanelOpen } from '@/utils/telemetry';
import {
  trackStudioV2CanvasModalClose,
  trackStudioV2CanvasModalOpen,
  type CanvasSelectionSnapshot,
} from '@/utils/studioV2Analytics';

export type CanvasPanelOpenPayload = Parameters<typeof trackCanvasPanelOpen>[0];
export type CanvasModalOpenPayload = Parameters<typeof trackStudioV2CanvasModalOpen>[0];
export type CanvasModalClosePayload = Parameters<typeof trackStudioV2CanvasModalClose>[0];

/**
 * Thin telemetry wrappers for the canvas checkout experience.
 * Having these helpers simplifies slice extraction and centralizes analytics contracts.
 */
export const emitCanvasPanelOpen = (tier: CanvasPanelOpenPayload) => {
  trackCanvasPanelOpen(tier);
};

export const emitCanvasModalOpen = (payload: CanvasModalOpenPayload) => {
  trackStudioV2CanvasModalOpen(payload);
};

export const emitCanvasModalClose = (payload: CanvasModalClosePayload) => {
  trackStudioV2CanvasModalClose(payload);
};

export type CanvasModalTelemetryParams = CanvasSelectionSnapshot;
