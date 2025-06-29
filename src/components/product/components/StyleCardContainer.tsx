
import { memo } from "react";
import { Card } from "@/components/ui/card";

interface StyleCardContainerProps {
  children: React.ReactNode;
  isSelected: boolean;
  styleId: number;
  styleName: string;
  shouldBlur: boolean;
  isGenerating: boolean;
  hasError: boolean;
  canAccess: boolean;
  onClick: () => void;
  onGenerateStyle: () => void;
}

const StyleCardContainer = memo(({
  children,
  isSelected,
  shouldBlur,
  isGenerating,
  hasError,
  canAccess,
  onClick
}: StyleCardContainerProps) => {
  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-300 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-purple-500 shadow-lg scale-[1.02]' : 'hover:scale-[1.01]'}
        ${shouldBlur ? 'blur-sm' : ''}
        ${isGenerating ? 'animate-pulse' : ''}
        ${hasError ? 'border-red-300 bg-red-50' : ''}
        ${!canAccess ? 'opacity-60' : ''}
      `}
      onClick={onClick}
    >
      {children}
    </Card>
  );
});

StyleCardContainer.displayName = 'StyleCardContainer';

export default StyleCardContainer;
