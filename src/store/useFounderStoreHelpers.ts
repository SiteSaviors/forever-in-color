import type { StyleOption } from '@/store/founder/storeTypes';
import { createMemoizedSelector } from '@/store/utils/memo';

export const selectCurrentStyle = createMemoizedSelector(
  (styles: StyleOption[], selectedStyleId: string | null | undefined) => {
    if (!selectedStyleId) {
      return undefined;
    }
    return styles.find((style) => style.id === selectedStyleId);
  }
);
