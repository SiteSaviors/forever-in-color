
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { SizeOption } from '../types';
import { sizeOptions } from '../data/sizeOptions';

interface SizeSelectionState {
  selectedOrientation: string;
  selectedSize: string;
  recommendedSize: string;
  currentSizeOption: SizeOption | null;
  isLoading: boolean;
  error: string | null;
  validationError: string | null;
  optimisticSelection: string | null;
}

type SizeSelectionAction =
  | { type: 'SET_ORIENTATION'; payload: string }
  | { type: 'SET_SIZE'; payload: string }
  | { type: 'SET_OPTIMISTIC_SIZE'; payload: string }
  | { type: 'ROLLBACK_OPTIMISTIC' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VALIDATION_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

const initialState: SizeSelectionState = {
  selectedOrientation: 'square',
  selectedSize: '',
  recommendedSize: '',
  currentSizeOption: null,
  isLoading: false,
  error: null,
  validationError: null,
  optimisticSelection: null,
};

function sizeSelectionReducer(
  state: SizeSelectionState,
  action: SizeSelectionAction
): SizeSelectionState {
  switch (action.type) {
    case 'SET_ORIENTATION':
      return {
        ...state,
        selectedOrientation: action.payload,
        selectedSize: '', // Reset size when orientation changes
        recommendedSize: getRecommendedSize(action.payload),
        currentSizeOption: null,
        validationError: null,
        optimisticSelection: null,
      };
    
    case 'SET_SIZE':
      const sizeOption = getSizeOption(state.selectedOrientation, action.payload);
      return {
        ...state,
        selectedSize: action.payload,
        currentSizeOption: sizeOption,
        validationError: null,
        optimisticSelection: null,
      };
    
    case 'SET_OPTIMISTIC_SIZE':
      return {
        ...state,
        optimisticSelection: action.payload,
      };
    
    case 'ROLLBACK_OPTIMISTIC':
      return {
        ...state,
        optimisticSelection: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationError: action.payload,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

function getRecommendedSize(orientation: string): string {
  const recommendations = {
    'square': '16" x 16"',
    'horizontal': '18" x 24"',
    'vertical': '16" x 20"'
  };
  return recommendations[orientation as keyof typeof recommendations] || '';
}

function getSizeOption(orientation: string, size: string): SizeOption | null {
  const orientationOptions = sizeOptions[orientation];
  return orientationOptions?.find(opt => opt.size === size) || null;
}

interface SizeSelectionContextType {
  state: SizeSelectionState;
  actions: {
    setOrientation: (orientation: string) => void;
    setSize: (size: string) => void;
    setOptimisticSize: (size: string) => void;
    rollbackOptimistic: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setValidationError: (error: string | null) => void;
    resetState: () => void;
  };
}

const SizeSelectionContext = createContext<SizeSelectionContextType | undefined>(undefined);

export const SizeSelectionProvider: React.FC<{
  children: React.ReactNode;
  initialOrientation?: string;
  onOrientationChange?: (orientation: string) => void;
  onSizeChange?: (size: string) => void;
}> = ({ 
  children, 
  initialOrientation = 'square',
  onOrientationChange,
  onSizeChange
}) => {
  const [state, dispatch] = useReducer(sizeSelectionReducer, {
    ...initialState,
    selectedOrientation: initialOrientation,
    recommendedSize: getRecommendedSize(initialOrientation),
  });

  const actions = {
    setOrientation: useCallback((orientation: string) => {
      dispatch({ type: 'SET_ORIENTATION', payload: orientation });
      onOrientationChange?.(orientation);
    }, [onOrientationChange]),

    setSize: useCallback((size: string) => {
      dispatch({ type: 'SET_SIZE', payload: size });
      onSizeChange?.(size);
    }, [onSizeChange]),

    setOptimisticSize: useCallback((size: string) => {
      dispatch({ type: 'SET_OPTIMISTIC_SIZE', payload: size });
    }, []),

    rollbackOptimistic: useCallback(() => {
      dispatch({ type: 'ROLLBACK_OPTIMISTIC' });
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    setValidationError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_VALIDATION_ERROR', payload: error });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, []),
  };

  return (
    <SizeSelectionContext.Provider value={{ state, actions }}>
      {children}
    </SizeSelectionContext.Provider>
  );
};

export const useSizeSelection = () => {
  const context = useContext(SizeSelectionContext);
  if (context === undefined) {
    throw new Error('useSizeSelection must be used within a SizeSelectionProvider');
  }
  return context;
};
