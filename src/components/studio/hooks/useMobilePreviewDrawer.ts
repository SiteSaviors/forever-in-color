import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const useMobilePreviewDrawer = () => {
  const [expanded, setExpanded] = useState(false);
  const [hasAutoExpandedOnce, setHasAutoExpandedOnce] = useState(false);
  const drawerPulseTimeoutRef = useRef<number | null>(null);
  const drawerPulseCleanupTimeoutRef = useRef<number | null>(null);
  const dragStartRef = useRef<number | null>(null);
  const dragHandledRef = useRef(false);

  const clearDrawerPulseTimeouts = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (drawerPulseTimeoutRef.current) {
      window.clearTimeout(drawerPulseTimeoutRef.current);
      drawerPulseTimeoutRef.current = null;
    }
    if (drawerPulseCleanupTimeoutRef.current) {
      window.clearTimeout(drawerPulseCleanupTimeoutRef.current);
      drawerPulseCleanupTimeoutRef.current = null;
    }
  }, []);

  const handleAutoExpandDrawer = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (hasAutoExpandedOnce) return;
    if (window.innerWidth >= 1024) return;

    setExpanded(true);
    setHasAutoExpandedOnce(true);

    clearDrawerPulseTimeouts();
    drawerPulseTimeoutRef.current = window.setTimeout(() => {
      const drawer = document.querySelector('[data-mobile-drawer]');
      if (drawer) {
        drawer.classList.add('motion-safe:animate-[pulse_600ms_ease-in-out_2]');
        drawerPulseCleanupTimeoutRef.current = window.setTimeout(() => {
          drawer.classList.remove('motion-safe:animate-[pulse_600ms_ease-in-out_2]');
          drawerPulseCleanupTimeoutRef.current = null;
        }, 1200);
      }
    }, 100);
  }, [clearDrawerPulseTimeouts, hasAutoExpandedOnce]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const startY = dragStartRef.current;
      if (startY == null) return;

      const delta = event.clientY - startY;
      if (Math.abs(delta) < 40) return;

      const shouldExpand = delta < 0;
      setExpanded(shouldExpand);
      dragHandledRef.current = true;
      dragStartRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
    },
    []
  );

  const endMobilePreviewDrag = useCallback(() => {
    const handled = dragHandledRef.current;
    dragStartRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', endMobilePreviewDrag);
    if (handled) {
      window.setTimeout(() => {
        dragHandledRef.current = false;
      }, 0);
    }
  }, [handlePointerMove]);

  const beginMobilePreviewDrag = useCallback(
    (clientY: number) => {
      dragStartRef.current = clientY;
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', endMobilePreviewDrag, { once: true });
    },
    [endMobilePreviewDrag, handlePointerMove]
  );

  const handleDrawerToggle = useCallback(() => {
    if (dragHandledRef.current) {
      dragHandledRef.current = false;
      return;
    }
    setExpanded((prev) => !prev);
  }, []);

  const handleDrawerPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== 'mouse') {
        beginMobilePreviewDrag(event.clientY);
      }
    },
    [beginMobilePreviewDrag]
  );

  const collapseDrawer = useCallback(() => {
    setExpanded(false);
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endMobilePreviewDrag);
      clearDrawerPulseTimeouts();
    };
  }, [clearDrawerPulseTimeouts, endMobilePreviewDrag, handlePointerMove]);

  return {
    expanded,
    hasAutoExpandedOnce,
    handleAutoExpandDrawer,
    handleDrawerPointerDown,
    handleDrawerToggle,
    collapseDrawer,
    clearDrawerPulseTimeouts,
  };
};

export default useMobilePreviewDrawer;
