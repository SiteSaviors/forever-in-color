
import { useCallback } from 'react';
import { ProgressAction } from '../types';

export const useBehaviorTracking = (dispatch: React.Dispatch<ProgressAction>) => {
  const trackHover = useCallback((duration: number) => {
    dispatch({ type: 'TRACK_HOVER', payload: duration });
  }, [dispatch]);

  const trackClick = useCallback((element: string) => {
    dispatch({ type: 'TRACK_CLICK', payload: element });
  }, [dispatch]);

  return { trackHover, trackClick };
};
