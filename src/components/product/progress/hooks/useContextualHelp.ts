
import { useCallback } from 'react';
import { ProgressAction } from '../types';

export const useContextualHelp = (dispatch: React.Dispatch<ProgressAction>) => {
  const showContextualHelp = useCallback((
    type: string, 
    message: string, 
    level: 'minimal' | 'moderate' | 'detailed' = 'minimal'
  ) => {
    dispatch({ type: 'SHOW_HELP', payload: { type, message, level } });
  }, [dispatch]);

  const hideContextualHelp = useCallback(() => {
    dispatch({ type: 'HIDE_HELP', payload: null });
  }, [dispatch]);

  return { showContextualHelp, hideContextualHelp };
};
