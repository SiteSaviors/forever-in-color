import { useEffect, useRef, useState } from 'react';

type PresenceState = 'entering' | 'entered' | 'exiting';

type PresenceOptions = {
  enterDuration?: number;
  exitDuration?: number;
  reduceMotion?: boolean;
};

const DEFAULT_ENTER = 200;
const DEFAULT_EXIT = 180;

export const useTransitionPresence = (
  visible: boolean,
  {
    enterDuration = DEFAULT_ENTER,
    exitDuration = DEFAULT_EXIT,
    reduceMotion = false,
  }: PresenceOptions = {}
) => {
  const [mounted, setMounted] = useState(visible);
  const [state, setState] = useState<PresenceState>(visible ? 'entered' : 'exiting');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (visible) {
      setMounted(true);
      if (reduceMotion) {
        setState('entered');
        return;
      }

      setState('entering');
      timerRef.current = window.setTimeout(() => {
        setState('entered');
        timerRef.current = null;
      }, enterDuration);
      return;
    }

    if (reduceMotion) {
      setState('exiting');
      setMounted(false);
      return;
    }

    setState('exiting');
    timerRef.current = window.setTimeout(() => {
      setMounted(false);
      timerRef.current = null;
    }, exitDuration);
  }, [visible, enterDuration, exitDuration, reduceMotion]);

  return { mounted, state } as const;
};

