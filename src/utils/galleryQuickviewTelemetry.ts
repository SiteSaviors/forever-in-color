import { sendAnalyticsEvent } from '@/utils/analyticsClient';

export const trackGalleryQuickviewLoad = (count: number) => {
  sendAnalyticsEvent('gallery_quickview_load', { count });
};

export const trackGalleryQuickviewThumbnailClick = (payload: {
  artId: string;
  styleId: string;
  savedAt: string;
  position: number;
}) => {
  sendAnalyticsEvent('gallery_quickview_thumbnail_click', payload);
};

export const trackGalleryQuickviewScroll = (position: number) => {
  sendAnalyticsEvent('gallery_quickview_scroll', { position });
};

export const trackGalleryQuickviewAnimationComplete = (artId: string) => {
  sendAnalyticsEvent('gallery_quickview_animation_complete', { artId });
};

export const trackGalleryQuickviewFetchError = (error: string) => {
  sendAnalyticsEvent('gallery_quickview_fetch_error', { error });
};

export const trackGalleryQuickviewDeleteModeChanged = (payload: {
  active: boolean;
  surface: 'desktop' | 'mobile';
}) => {
  sendAnalyticsEvent('gallery_quickview_delete_mode_changed', payload);
};

export const trackGalleryQuickviewDeleteRequested = (payload: {
  artId: string;
  styleId: string;
  position: number;
  surface: 'desktop' | 'mobile';
  hasUpload: boolean;
}) => {
  sendAnalyticsEvent('gallery_quickview_delete_requested', payload);
};

export const trackGalleryQuickviewDeleteResult = (payload: {
  artId: string;
  styleId: string;
  success: boolean;
  surface: 'desktop' | 'mobile';
  durationMs: number;
  status?: number;
  errorCode?: 'auth' | 'network' | 'server' | 'unknown';
}) => {
  sendAnalyticsEvent('gallery_quickview_delete_result', payload);
};
