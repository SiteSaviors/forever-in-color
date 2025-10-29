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
