import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SectionKey = string;

export type ToneSectionPrefetchState = {
  isActive: boolean;
  hasPrefetched: boolean;
};

export type ToneSectionPrefetchMap = Record<SectionKey, ToneSectionPrefetchState>;

type PrefetchCallback = (section: SectionKey) => void;

const createInitialMap = (keys: SectionKey[]): ToneSectionPrefetchMap =>
  keys.reduce<ToneSectionPrefetchMap>((acc, key) => {
    acc[key] = { isActive: false, hasPrefetched: false };
    return acc;
  }, {});

export const useToneSectionPrefetch = (
  sectionKeys: SectionKey[],
  onPrefetch: PrefetchCallback
) => {
  const [prefetchMap, setPrefetchMap] = useState<ToneSectionPrefetchMap>(() =>
    createInitialMap(sectionKeys)
  );

  const observersRef = useRef<Map<SectionKey, IntersectionObserver>>(new Map());

  useEffect(() => {
    setPrefetchMap((previous) => {
      const next = { ...previous };
      sectionKeys.forEach((key) => {
        if (!next[key]) {
          next[key] = { isActive: false, hasPrefetched: false };
        }
      });
      Object.keys(next).forEach((key) => {
        if (!sectionKeys.includes(key)) {
          delete next[key];
        }
      });
      return next;
    });
  }, [sectionKeys]);

  useEffect(() => {
    const observers = observersRef.current;
    return () => {
      observers.forEach((observer) => observer.disconnect());
      observers.clear();
    };
  }, []);

  const setActive = useCallback(
    (sectionKey: SectionKey, active: boolean) => {
    setPrefetchMap((current) => {
      const state = current[sectionKey];
      if (!state || state.isActive === active) {
        return current;
      }
      return {
        ...current,
        [sectionKey]: {
          ...state,
          isActive: active,
        },
      };
    });

    if (active) {
      setPrefetchMap((current) => {
        const state = current[sectionKey];
        if (!state || state.hasPrefetched) {
          return current;
        }
        onPrefetch(sectionKey);
        return {
          ...current,
          [sectionKey]: {
            ...state,
            hasPrefetched: true,
          },
        };
      });
    }
    },
    [onPrefetch]
  );

  const registerNode = useCallback(
    (sectionKey: SectionKey) => (node: HTMLElement | null) => {
    const existingObserver = observersRef.current.get(sectionKey);
    if (existingObserver) {
      existingObserver.disconnect();
      observersRef.current.delete(sectionKey);
    }

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(sectionKey, true);
            observer.disconnect();
            observersRef.current.delete(sectionKey);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '120px 0px 120px 0px',
      }
    );

    observer.observe(node);
    observersRef.current.set(sectionKey, observer);
  },
    [setActive]
  );

  return useMemo(
    () => ({
      prefetchMap,
      setActive,
      registerNode,
    }),
    [prefetchMap, registerNode, setActive]
  );
};
