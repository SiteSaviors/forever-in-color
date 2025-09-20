
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ShowMoreToggleProps {
  showAllStyles: boolean;
  secondaryStylesCount: number;
  onToggle: () => void;
}

const ShowMoreToggle = ({
  showAllStyles,
  secondaryStylesCount,
  onToggle
}: ShowMoreToggleProps) => {
  if (secondaryStylesCount === 0) return null;

  return (
    <div className="text-center py-4">
      <Button
        variant="outline"
        onClick={onToggle}
        className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:border-purple-300 hover:text-purple-700 hover:shadow-lg transform hover:scale-105"
      >
        <Eye className="w-4 h-4 mr-2" />
        {showAllStyles ? 'Show Less Styles' : `Explore ${secondaryStylesCount} More Styles`}
      </Button>
    </div>
  );
};

export default ShowMoreToggle;
