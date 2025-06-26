
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
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
      className="w-full min-h-[56px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 transition-all duration-300 border-0 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-base md:text-lg" 
      size="lg"
    >
      <Check className="w-5 h-5 mr-3" />
      Continue with {size}
      <ArrowRight className="w-5 h-5 ml-3" />
    </Button>
  );
};

export default ContinueButton;
