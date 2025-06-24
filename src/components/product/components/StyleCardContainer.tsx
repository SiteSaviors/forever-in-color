
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
    <div className="relative p-0 md:p-2">
      {/* Simplified background - only on desktop */}
      <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-70 hidden md:block"></div>
      
      {/* Optimized card with mobile-first responsive design */}
      <Card 
        className={`group cursor-pointer transition-all duration-200 ease-out relative z-10 bg-white/98 border-0 
          shadow-sm hover:shadow-md md:shadow-lg md:hover:shadow-xl
          ${!shouldBlur && !isMobile ? 'hover:scale-[1.02] hover:-translate-y-1' : ''} 
          h-full flex flex-col
          ${isSelected ? 
            'ring-2 md:ring-4 ring-purple-500 shadow-purple-200 scale-[1.01] -translate-y-0.5' : 
            ''
          }
        `}
        onClick={handleCardClick}
      >
        <CardContent className="p-0 overflow-hidden rounded-xl h-full flex flex-col">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleCardContainer;
