
import { CheckCircle } from "lucide-react";

interface MilestoneOverlayProps {
  show: boolean;
  animatingStep: number | null;
}

const MilestoneOverlay = ({ show, animatingStep }: MilestoneOverlayProps) => {
  if (!show || !animatingStep) return null;

  return (
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse flex items-center justify-center z-10">
      <div className="bg-white rounded-full p-6 shadow-2xl animate-bounce">
        <div className="flex flex-col items-center">
          <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
          <span className="font-bold text-green-700">Step {animatingStep} Complete!</span>
          <span className="text-sm text-gray-600">+25 momentum points</span>
        </div>
      </div>
    </div>
  );
};

export default MilestoneOverlay;
