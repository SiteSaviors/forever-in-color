
import React, { createContext, useContext, ReactNode } from 'react';

interface StyleCardContextType {
  selectedOrientation: string;
  croppedImage: string | null;
  selectedStyle: number | null;
  shouldBlur?: boolean;
  showContinueButton?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

const StyleCardContext = createContext<StyleCardContextType | null>(null);

interface StyleCardProviderProps {
  children: ReactNode;
  selectedOrientation: string;
  croppedImage: string | null;
  selectedStyle: number | null;
  shouldBlur?: boolean;
  showContinueButton?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

export const StyleCardProvider = ({
  children,
  selectedOrientation,
  croppedImage,
  selectedStyle,
  shouldBlur = false,
  showContinueButton = true,
  onStyleClick,
  onContinue
}: StyleCardProviderProps) => {
  const contextValue: StyleCardContextType = {
    selectedOrientation,
    croppedImage,
    selectedStyle,
    shouldBlur,
    showContinueButton,
    onStyleClick,
    onContinue
  };

  return (
    <StyleCardContext.Provider value={contextValue}>
      {children}
    </StyleCardContext.Provider>
  );
};

export const useStyleCardContext = (): StyleCardContextType => {
  const context = useContext(StyleCardContext);
  if (!context) {
    throw new Error('useStyleCardContext must be used within a StyleCardProvider');
  }
  return context;
};
