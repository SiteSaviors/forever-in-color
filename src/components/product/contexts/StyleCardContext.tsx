
import { createContext, useContext } from 'react';

interface StyleCardContextType {
  croppedImage: string | null;
  selectedStyle: number | null;
  selectedOrientation: string;
  shouldBlur: boolean;
  previewUrls: { [key: number]: string };
  autoGenerationComplete: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue: () => void;
}

const StyleCardContext = createContext<StyleCardContextType | null>(null);

export const StyleCardContextProvider = ({ 
  children, 
  value 
}: { 
  children: React.ReactNode; 
  value: StyleCardContextType 
}) => {
  return (
    <StyleCardContext.Provider value={value}>
      {children}
    </StyleCardContext.Provider>
  );
};

// Add the missing export alias
export const StyleCardProvider = StyleCardContextProvider;

export const useStyleCardContext = () => {
  const context = useContext(StyleCardContext);
  if (!context) {
    throw new Error('useStyleCardContext must be used within a StyleCardContextProvider');
  }
  return context;
};
