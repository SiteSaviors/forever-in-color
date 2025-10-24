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
  const registerCallbacksRef = useRef<Map<string, (node: HTMLElement | null) => void>>(new Map());
  const groupRefsRef = useRef<Map<string, PrefetchGroup>>(new Map());

  useEffect(() => {
    const observers = observersRef.current;
    const registerCallbacks = registerCallbacksRef.current;
    const groupRefs = groupRefsRef.current;
    return () => {
      observers.forEach((observer) => observer.disconnect());
      observers.clear();
      registerCallbacks.clear();
      groupRefs.clear();
    };
  }, []);

  useEffect(() => {
    const activeIds = new Set(groups.map((group) => group.id));
    registerCallbacksRef.current.forEach((_callback, id) => {
      if (!activeIds.has(id)) {
        registerCallbacksRef.current.delete(id);
        groupRefsRef.current.delete(id);
        const observer = observersRef.current.get(id);
        if (observer) {
          observer.disconnect();
          observersRef.current.delete(id);
        }
      }
    });
  }, [groups]);

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
      groupRefsRef.current.set(group.id, group);

      if (!registerCallbacksRef.current.has(group.id)) {
        const callback = (node: HTMLElement | null) => {
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
                if (!entry.isIntersecting) return;
                const latestGroup = groupRefsRef.current.get(group.id);
                if (latestGroup) {
                  void prefetchGroup(latestGroup);
                }
                observer.disconnect();
                observersRef.current.delete(group.id);
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

        registerCallbacksRef.current.set(group.id, callback);
      }

      return registerCallbacksRef.current.get(group.id)!;
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
