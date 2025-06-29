
import { createContext, useContext, useReducer, useCallback } from "react";
import { stylePreviewReducer, initialState } from "./stylePreviewReducer";
import { StylePreviewState, StylePreviewAction } from "./types";

interface StylePreviewContextType {
  state: StylePreviewState;
  dispatch: React.Dispatch<StylePreviewAction>;
  generatePreview: (styleId: number, styleName: string) => Promise<void>;
}

const StylePreviewContext = createContext<StylePreviewContextType | undefined>(undefined);

interface StylePreviewProviderProps {
  children: React.ReactNode;
  croppedImage: string | null;
  selectedOrientation: string;
}

export const StylePreviewProvider = ({ children, croppedImage, selectedOrientation }: StylePreviewProviderProps) => {
  const [state, dispatch] = useReducer(stylePreviewReducer, initialState);

  const generatePreview = useCallback(async (styleId: number, styleName: string) => {
    if (!croppedImage) return;
    
    dispatch({ type: 'START_GENERATION', payload: { styleId } });
    
    try {
      // Mock preview generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockPreviewUrl = croppedImage; // For now, use the cropped image
      
      dispatch({ 
        type: 'GENERATION_SUCCESS', 
        payload: { 
          styleId, 
          previewUrl: mockPreviewUrl 
        } 
      });
    } catch (error) {
      dispatch({ 
        type: 'GENERATION_ERROR', 
        payload: { 
          styleId, 
          error: error.message || 'Generation failed' 
        } 
      });
    }
  }, [croppedImage]);

  const value = {
    state,
    dispatch,
    generatePreview
  };

  return (
    <StylePreviewContext.Provider value={value}>
      {children}
    </StylePreviewContext.Provider>
  );
};

export const useStylePreviewContext = () => {
  const context = useContext(StylePreviewContext);
  if (context === undefined) {
    throw new Error('useStylePreviewContext must be used within a StylePreviewProvider');
  }
  return context;
};
