/**
 * Stock Library Telemetry
 *
 * Type-safe analytics tracking for stock library interactions.
 * All events are sent via the unified analytics client.
 */

import { sendAnalyticsEvent } from '@/utils/analyticsClient';
import type { StockCategory } from '@/utils/stockLibraryApi';

/**
 * Track when stock library modal is opened
 */
export const trackStockModalOpened = (payload: {
  source: 'empty_state' | 'try_sample' | 'browse_cta';
  hasUpload: boolean;
}) => {
  sendAnalyticsEvent('stock_modal_opened', payload);
};

/**
 * Track when a category is selected
 */
export const trackStockCategorySelected = (payload: {
  category: StockCategory;
  source: 'category_card' | 'back_button';
}) => {
  sendAnalyticsEvent('stock_category_selected', payload);
};

/**
 * Track when search is performed
 */
export const trackStockSearchPerformed = (payload: {
  query: string;
  resultCount: number;
  category: StockCategory;
}) => {
  sendAnalyticsEvent('stock_search_performed', payload);
};

/**
 * Track when a stock image is applied
 */
export const trackStockImageApplied = (payload: {
  imageId: string;
  category: StockCategory;
  position: number;
  searchActive: boolean;
  timeInModalMs: number;
}) => {
  sendAnalyticsEvent('stock_image_applied', payload);
};

/**
 * Track when stock library modal is closed
 */
export const trackStockModalClosed = (payload: {
  reason: 'continue' | 'upload_own' | 'dismiss' | 'esc_key';
  durationMs: number;
  imagesViewed: number;
  imageApplied: boolean;
  category: StockCategory | null;
}) => {
  sendAnalyticsEvent('stock_modal_closed', payload);
};

/**
 * Track when user scrolls in the grid (infinite scroll)
 */
export const trackStockScrolled = (payload: {
  page: number;
  imagesLoaded: number;
}) => {
  sendAnalyticsEvent('stock_scrolled', payload);
};

/**
 * Track when fetch error occurs
 */
export const trackStockFetchError = (payload: {
  error: string;
  category: StockCategory;
  search?: string;
}) => {
  sendAnalyticsEvent('stock_fetch_error', payload);
};

/**
 * Track when user transitions from category selector to grid
 */
export const trackStockViewChanged = (payload: {
  from: 'category_selector' | 'grid_browser';
  to: 'category_selector' | 'grid_browser';
  category: StockCategory;
}) => {
  sendAnalyticsEvent('stock_view_changed', payload);
};
