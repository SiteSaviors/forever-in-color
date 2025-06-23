
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle } from "lucide-react";

interface StyleCardIndicatorsProps {
  hasGeneratedPreview: boolean;
  isPopular: boolean;
  isSelected: boolean;
  isStyleGenerated?: boolean;
}

const StyleCardIndicators = ({ 
  hasGeneratedPreview, 
  isPopular, 
  isSelected,
  isStyleGenerated = false
}: StyleCardIndicatorsProps) => {
  if (isSelected) {
    return (
      <Badge className="bg-purple-600 text-white text-xs">
        Selected
      </Badge>
    );
  }

  if (isStyleGenerated) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 text-xs flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Done
      </Badge>
    );
  }

  if (hasGeneratedPreview) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        Ready
      </Badge>
    );
  }

  return null;
};

export default StyleCardIndicators;
