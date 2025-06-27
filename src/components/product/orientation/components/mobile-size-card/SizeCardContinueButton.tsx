
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SizeCardContinueButtonProps {
  size: string;
  isSelected: boolean;
  onContinue: (e: React.MouseEvent) => void;
}

const SizeCardContinueButton: React.FC<SizeCardContinueButtonProps> = ({
  size,
  isSelected,
  onContinue
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`
      transition-all duration-300 mt-auto
      ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
    `}>
      <Button 
        onClick={onContinue} 
        className={`
          w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 
          text-white font-bold py-4 px-6 transition-all duration-300 border-0 rounded-xl 
          shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] 
          ${isMobile ? 'min-h-[56px] text-base' : 'min-h-[60px] text-lg'} font-poppins
        `}
        size="lg"
      >
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold">Continue with {size}</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </Button>
    </div>
  );
};

export default SizeCardContinueButton;
