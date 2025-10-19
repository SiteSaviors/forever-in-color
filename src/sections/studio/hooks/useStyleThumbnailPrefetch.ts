import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type PrefetchGroup = {
  id: string;
  thumbnails: string[];
};

export type PrefetchGroupStatus = 'idle' | 'pending' | 'done' | 'error';

export type PrefetchState = Record<string, { status: PrefetchGroupStatus; error?: string }>;

type UseStyleThumbnailPrefetchOptions = {
  groups: PrefetchGroup[];
  threshold?: number;
  rootMargin?: string;
};

const DEFAULT_THRESHOLD = 0.2;
const DEFAULT_ROOT_MARGIN = '120px 0px 120px 0px';

const decodeImage = async (src: string): Promise<void> => {
  const img = new Image();
  img.src = src;

  if (img.complete) {
    if (img.decode) {
      await img.decode().catch(() => {});
    }
    return;
  }

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      if (img.decode) {
        img.decode().then(resolve).catch(() => resolve());
      } else {
        resolve();
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
};

export const useStyleThumbnailPrefetch = ({
  groups,
  threshold = DEFAULT_THRESHOLD,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: UseStyleThumbnailPrefetchOptions) => {
  const [prefetchState, setPrefetchState] = useState<PrefetchState>(() =>
    Object.fromEntries(groups.map((group) => [group.id, { status: 'idle' as PrefetchGroupStatus }]))
  );

  useEffect(() => {
    setPrefetchState((current) => {
      const next: PrefetchState = { ...current };
      groups.forEach((group) => {
        if (!next[group.id]) {
          next[group.id] = { status: 'idle' };
        }
      });
      Object.keys(next).forEach((key) => {
        if (!groups.some((group) => group.id === key)) {
          delete next[key];
        }
      });
      return next;
    });
  }, [groups]);

  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());

  useEffect(() => {
    const observers = observersRef.current;
    return () => {
      observers.forEach((observer) => observer.disconnect());
      observers.clear();
    };
  }, []);

  const updateStatus = useCallback((groupId: string, status: PrefetchGroupStatus, error?: string) => {
    setPrefetchState((current) => {
      const existing = current[groupId];
      if (existing && existing.status === status && existing.error === error) {
        return current;
      }
      return {
        ...current,
        [groupId]: { status, error },
      };
    });
  }, []);

  const prefetchGroup = useCallback(
    async (group: PrefetchGroup) => {
      updateStatus(group.id, 'pending');
      try {
        await Promise.all(group.thumbnails.map((thumbnail) => decodeImage(thumbnail)));
        updateStatus(group.id, 'done');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to prefetch thumbnails';
        updateStatus(group.id, 'error', message);
        if (typeof window !== 'undefined') {
          console.warn('[StyleThumbnailPrefetch] Failed', group.id, message);
        }
      }
    },
    [updateStatus]
  );

  const registerGroup = useCallback(
    (group: PrefetchGroup) => {
      return (node: HTMLElement | null) => {
        const existingObserver = observersRef.current.get(group.id);
        if (existingObserver) {
          existingObserver.disconnect();
          observersRef.current.delete(group.id);
        }

        if (!node) {
          return;
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                void prefetchGroup(group);
                observer.disconnect();
                observersRef.current.delete(group.id);
              }
            });
          },
          {
            threshold,
            rootMargin,
          }
        );

        observer.observe(node);
        observersRef.current.set(group.id, observer);
      };
    },
    [prefetchGroup, threshold, rootMargin]
  );

  const hasPrefetched = useMemo(() => {
    return (groupId: string) => prefetchState[groupId]?.status === 'done';
  }, [prefetchState]);

  return {
    registerGroup,
    prefetchState,
    hasPrefetched,
    prefetchGroup,
  };
};
