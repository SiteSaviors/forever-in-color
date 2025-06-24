
import { StylePreviewState, StylePreviewAction } from './types';

export const initialState: StylePreviewState = {};

export function stylePreviewReducer(
  state: StylePreviewState, 
  action: StylePreviewAction
): StylePreviewState {
  switch (action.type) {
    case 'START_GENERATION':
      return {
        ...state,
        [action.styleId]: { status: 'loading' }
      };
    case 'GENERATION_SUCCESS':
      return {
        ...state,
        [action.styleId]: { status: 'success', url: action.url }
      };
    case 'GENERATION_ERROR':
      return {
        ...state,
        [action.styleId]: { status: 'error', error: action.error }
      };
    case 'RETRY_GENERATION':
      return {
        ...state,
        [action.styleId]: { status: 'loading' }
      };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}
