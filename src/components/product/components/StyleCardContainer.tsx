
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

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
  // Get style-specific selection colors for the main card border
  const getCardSelectionColors = () => {
    const colorMap: { [key: number]: string } = {
      1: "ring-gray-500",
      2: "ring-amber-500", 
      4: "ring-blue-500",
      5: "ring-pink-500",
      6: "ring-purple-500",
      7: "ring-cyan-500",
      8: "ring-slate-500",
      9: "ring-rose-500",
      10: "ring-emerald-500",
      11: "ring-violet-500",
      13: "ring-indigo-500",
      15: "ring-yellow-500",
    };
    
    return colorMap[styleId] || colorMap[1];
  };

  const cardSelectionRing = getCardSelectionColors();

  // Debug click handler
  const handleCardClick = () => {
    console.log(`🎯 CARD CONTAINER CLICKED ▶️ Style ID: ${styleId}, shouldBlur: ${shouldBlur}`);
    onClick();
  };

  return (
    <div className="relative p-2">
      {/* Canvas texture background wrapper */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl opacity-70" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.12) 1px, transparent 0)`,
             backgroundSize: '18px 18px'
           }}>
      </div>
      
      {/* Premium floating card with simplified selection feedback - ALWAYS CLICKABLE */}
      <Card 
        className={`group cursor-pointer transition-all duration-500 ease-out relative z-10 bg-white/98 backdrop-blur-sm border-0 
          shadow-[0_10px_40px_rgb(0,0,0,0.12)] 
          hover:shadow-[0_25px_70px_rgb(0,0,0,0.15)] 
          ${!shouldBlur ? 'hover:scale-[1.03] hover:-translate-y-2' : ''} 
          h-full flex flex-col
          ${isSelected ? 
            `ring-4 ring-purple-500 shadow-[0_25px_70px_rgba(147,51,234,0.3)] scale-[1.02] -translate-y-1` : 
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
