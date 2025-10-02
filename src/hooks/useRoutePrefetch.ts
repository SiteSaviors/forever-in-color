import { useCallback, useMemo } from "react";

type Prefetcher = () => Promise<unknown>;

const prefetchers: Record<string, Prefetcher> = {
  product: () => import("@/pages/Product"),
  auth: () => import("@/pages/Auth"),
};

export const useRoutePrefetch = () => {
  const prefetchProduct = useCallback(() => {
    void prefetchers.product();
  }, []);

  const prefetchAuth = useCallback(() => {
    void prefetchers.auth();
  }, []);

  return useMemo(
    () => ({ prefetchProduct, prefetchAuth }),
    [prefetchAuth, prefetchProduct]
  );
};

export type RoutePrefetch = ReturnType<typeof useRoutePrefetch>;
