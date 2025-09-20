
import { useState, useEffect, useCallback } from 'react';

interface UseDebouncedInteractionOptions {
  delay?: number;
  leading?: boolean;
}

export const useDebouncedInteraction = (
  initialValue: boolean = false,
  options: UseDebouncedInteractionOptions = {}
) => {
  const { delay = 100, leading = false } = options;
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    // If leading is true, update immediately on first change
    if (leading && immediateValue !== debouncedValue) {
      setDebouncedValue(immediateValue);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [immediateValue, delay, leading, debouncedValue]);

  const setValue = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setImmediateValue(value);
  }, []);

  return [debouncedValue, setValue, immediateValue] as const;
};
