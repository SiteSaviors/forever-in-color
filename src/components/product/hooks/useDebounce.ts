
import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

// Specialized hook for API requests with abort controller
export function useDebouncedApiRequest<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  delay: number = 300
) {
  const abortControllerRef = useRef<AbortController>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedRequest = useCallback(
    async (...args: Parameters<T>) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            // Create new abort controller
            abortControllerRef.current = new AbortController();
            
            // Execute API call
            const result = await apiCall(...args);
            resolve(result);
          } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
              reject(error);
            }
          }
        }, delay);
      });
    },
    [apiCall, delay]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedRequest, cancel };
}
