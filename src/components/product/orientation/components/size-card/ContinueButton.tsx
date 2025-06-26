
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 text-white font-semibold py-3 transition-all duration-150 border-0 min-h-[44px] touch-manipulation" 
      size="lg"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Continue with {size}
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
};

export default ContinueButton;
