export type StepOneEvent =
  | { type: 'substep'; value: 'upload' | 'crop' | 'style-selection' | 'complete' }
  | { type: 'preview'; styleId: string; status: 'generating' | 'ready' | 'error' }
  | { type: 'cta'; value: 'continue-to-studio' }
  | { type: 'upload_started' }
  | { type: 'upload_success'; value: string };

export function emitStepOneEvent(event: StepOneEvent) {
  // Placeholder adapter: log to console now, replace with analytics pipeline later.
  console.log('[FounderTelemetry]', event);
}
