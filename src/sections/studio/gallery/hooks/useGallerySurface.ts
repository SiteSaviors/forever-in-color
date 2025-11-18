import { useEffect, useState } from 'react';

const getSurface = (): 'desktop' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(max-width: 1023px)').matches ? 'mobile' : 'desktop';
};

const detectCoarsePointer = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
};

export const useGallerySurface = () => {
  const [surface, setSurface] = useState<'desktop' | 'mobile'>(() => getSurface());
  const [isCoarse, setIsCoarse] = useState(() => detectCoarsePointer());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const handleSurfaceChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const nextSurface =
        'matches' in event ? (event.matches ? 'mobile' : 'desktop') : event.matches ? 'mobile' : 'desktop';
      setSurface(nextSurface);
    };
    handleSurfaceChange(mq);
    mq.addEventListener('change', handleSurfaceChange);
    return () => mq.removeEventListener('change', handleSurfaceChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pointerMq = window.matchMedia('(pointer: coarse)');
    const handlePointerChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in event ? event.matches : event.matches;
      setIsCoarse(matches);
    };
    handlePointerChange(pointerMq);
    pointerMq.addEventListener('change', handlePointerChange);
    return () => pointerMq.removeEventListener('change', handlePointerChange);
  }, []);

  return {
    surface,
    isMobileSurface: surface === 'mobile',
    isCoarsePointer: () => isCoarse,
  };
};

export default useGallerySurface;
