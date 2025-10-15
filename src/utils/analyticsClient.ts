type AnalyticsPayload = Record<string, unknown>;

type PosthogLike = {
  capture: (event: string, properties?: AnalyticsPayload) => void;
};

type MixpanelLike = {
  track: (event: string, properties?: AnalyticsPayload) => void;
};

declare global {
  interface Window {
    posthog?: PosthogLike;
    mixpanel?: MixpanelLike;
  }
}

const dispatchBrowserAnalyticsEvent = (eventName: string, payload: AnalyticsPayload) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('wondertone-analytics', { detail: { event: eventName, payload } }));
};

export const sendAnalyticsEvent = (eventName: string, payload: AnalyticsPayload = {}) => {
  const enrichedPayload: AnalyticsPayload = {
    ...payload,
    timestamp: payload.timestamp ?? Date.now(),
  };

  if (typeof window !== 'undefined') {
    const { posthog, mixpanel } = window;

    if (posthog && typeof posthog.capture === 'function') {
      posthog.capture(eventName, enrichedPayload);
      dispatchBrowserAnalyticsEvent(eventName, enrichedPayload);
      return;
    }

    if (mixpanel && typeof mixpanel.track === 'function') {
      mixpanel.track(eventName, enrichedPayload);
      dispatchBrowserAnalyticsEvent(eventName, enrichedPayload);
      return;
    }
  }

  dispatchBrowserAnalyticsEvent(eventName, enrichedPayload);
  // Fallback logging so engineers still see the signal during development.
  if (import.meta.env.DEV) {
    console.info('[Analytics:FALLBACK]', eventName, enrichedPayload);
  }
};
