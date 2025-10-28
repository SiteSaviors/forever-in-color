export type StepOneEvent =
  | { type: 'substep'; value: 'upload' | 'crop' | 'style-selection' | 'complete' }
  | { type: 'preview'; styleId: string; status: 'generating' | 'ready' | 'error' }
  | { type: 'cta'; value: 'continue-to-studio' }
  | { type: 'upload_started' }
  | { type: 'upload_success'; value: string }
  | { type: 'tone_section_view'; tone: string }
  | { type: 'tone_style_select'; styleId: string; tone?: string }
  | { type: 'tone_style_locked'; styleId: string; requiredTier?: string | null }
  | { type: 'tone_upgrade_prompt'; styleId?: string; tone?: string; requiredTier?: string | null }
  | { type: 'conversion'; status: 'start' | 'success' | 'error'; cacheHit?: boolean };

export function emitStepOneEvent(event: StepOneEvent) {
  // Placeholder adapter: log to console now, replace with analytics pipeline later.
  console.log('[FounderTelemetry]', event);
}

export type AuthGateEvent =
  | { type: 'auth_modal_shown'; surface: 'preview'; styleId?: string | null }
  | { type: 'auth_modal_completed'; method: 'google' | 'email' }
  | { type: 'auth_modal_abandoned'; reason: 'dismiss' | 'close' };

export function emitAuthGateEvent(event: AuthGateEvent) {
  console.log('[AuthGateTelemetry]', event);
}

// Phase 2: Progressive Disclosure Analytics Events
export type ProgressiveDisclosureEvent =
  | { type: 'cta_download_click'; userTier: string; isPremium: boolean; timestamp: number }
  | { type: 'cta_canvas_click'; userTier: string; timestamp: number }
  | { type: 'canvas_panel_open'; userTier: string; timestamp: number }
  | { type: 'download_success'; userTier: string; styleId: string; timestamp: number }
  | { type: 'order_started'; userTier: string; orderTotal: number; hasEnhancements: boolean; timestamp: number };

export function trackDownloadCTAClick(userTier: string, isPremium: boolean) {
  const event: ProgressiveDisclosureEvent = {
    type: 'cta_download_click',
    userTier,
    isPremium,
    timestamp: Date.now(),
  };
  console.log('[ProgressiveDisclosure]', event);
  // TODO: Send to analytics pipeline (PostHog, Mixpanel, etc.)
}

export function trackCanvasCTAClick(userTier: string) {
  const event: ProgressiveDisclosureEvent = {
    type: 'cta_canvas_click',
    userTier,
    timestamp: Date.now(),
  };
  console.log('[ProgressiveDisclosure]', event);
}

export function trackCanvasPanelOpen(userTier: string) {
  const event: ProgressiveDisclosureEvent = {
    type: 'canvas_panel_open',
    userTier,
    timestamp: Date.now(),
  };
  console.log('[ProgressiveDisclosure]', event);
}

export function trackDownloadSuccess(userTier: string, styleId: string) {
  const event: ProgressiveDisclosureEvent = {
    type: 'download_success',
    userTier,
    styleId,
    timestamp: Date.now(),
  };
  console.log('[ProgressiveDisclosure]', event);
}

export function trackOrderStarted(userTier: string, orderTotal: number, hasEnhancements: boolean) {
  const event: ProgressiveDisclosureEvent = {
    type: 'order_started',
    userTier,
    orderTotal,
    hasEnhancements,
    timestamp: Date.now(),
  };
  console.log('[ProgressiveDisclosure]', event);
}

export function trackRuntimeMetric(name: string, payload?: Record<string, unknown>) {
  console.log('[RuntimeMetric]', { name, payload, timestamp: Date.now() });
}
