import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ENABLE_PREVIEW_QUERY_EXPERIMENT } from '@/config/featureFlags';

/**
 * Shared QueryClient instance guarded by the preview experiment flag.
 * We instantiate it eagerly so that enabling the flag does not trigger
 * re-renders or break React Query cache identity across the app.
 */
export const previewQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

type ReactQueryBoundaryProps = {
  children: ReactNode;
};

/**
 * Wraps children with QueryClientProvider only when the experiment flag
 * is enabled. When disabled we render children untouched to avoid any
 * runtime behavior change.
 */
export const getPreviewQueryClient = () => previewQueryClient;

const ReactQueryBoundary = ({ children }: ReactQueryBoundaryProps) => {
  if (!ENABLE_PREVIEW_QUERY_EXPERIMENT) {
    return <>{children}</>;
  }

  return <QueryClientProvider client={previewQueryClient}>{children}</QueryClientProvider>;
};

export default ReactQueryBoundary;
