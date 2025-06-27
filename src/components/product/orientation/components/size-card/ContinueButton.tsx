
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useCallback } from "react";

interface ContinueButtonProps {
  size: string;
  isSelected: boolean;
  onContinue: (e: React.MouseEvent) => void;
}

const ContinueButton = ({ size, isSelected, onContinue }: ContinueButtonProps) => {
  const handleContinueClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue(e);
  }, [onContinue]);

  if (!isSelected) return null;

  return (
    <Button 
      onClick={handleContinueClick} 
      className="w-full min-h-[60px] bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 text-white font-bold py-4 px-8 transition-all duration-300 border-0 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] text-base md:text-lg font-poppins tracking-tight drop-shadow-lg" 
      size="lg"
    >
      <div className="flex items-center justify-center gap-3">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <Check className="w-5 h-5" />
        <span className="font-bold">Continue with {size}</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </Button>
  );
};

export default ContinueButton;
