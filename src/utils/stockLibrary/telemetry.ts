import {
  trackStockModalClosed,
  trackStockSearchPerformed,
  trackStockScrolled,
} from '@/utils/stockLibraryTelemetry';

export type StockModalClosedPayload = Parameters<typeof trackStockModalClosed>[0];
export type StockSearchPerformedPayload = Parameters<typeof trackStockSearchPerformed>[0];
export type StockScrolledPayload = Parameters<typeof trackStockScrolled>[0];

export const emitStockModalClosed = (payload: StockModalClosedPayload) => {
  trackStockModalClosed(payload);
};

export const emitStockSearchPerformed = (payload: StockSearchPerformedPayload) => {
  trackStockSearchPerformed(payload);
};

export const emitStockScrolled = (payload: StockScrolledPayload) => {
  trackStockScrolled(payload);
};
