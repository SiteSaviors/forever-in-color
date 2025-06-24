
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StyleCardContainerProps {
  isSelected: boolean;
  styleId: number;
  shouldBlur?: boolean;
  children: ReactNode;
  onClick: () => void;
}

const StyleCardContainer = ({
  isSelected,
  styleId,
  shouldBlur = false,
  children,
  onClick
}: StyleCardContainerProps) => {
  const isMobile = useIsMobile();
  
  const handleCardClick = () => {
    console.log(`🎯 CARD CONTAINER CLICKED ▶️ Style ID: ${styleId}, shouldBlur: ${shouldBlur}`);
    onClick();
  };

  return (
    <div className="relative w-full">
      {/* Mobile-first card with consistent height and inner ring for selection */}
      <Card 
        className={`group cursor-pointer transition-all duration-200 ease-out bg-white border-0 
          shadow-sm hover:shadow-md 
          ${!shouldBlur && !isMobile ? 'hover:scale-[1.01] hover:-translate-y-0.5' : ''} 
          min-h-[280px] overflow-hidden rounded-xl
          ring-offset-2 ring-offset-white
          ${isSelected ? 
            'ring-4 ring-purple-500 shadow-lg' : 
            'ring-0'
          }
        `}
        onClick={handleCardClick}
      >
        <CardContent className="p-0 h-full flex flex-col">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleCardContainer;
