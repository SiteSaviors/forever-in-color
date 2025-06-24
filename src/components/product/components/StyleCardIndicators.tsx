
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Eye, Expand } from "lucide-react";

interface StyleCardIndicatorsProps {
  isPopular: boolean;
  showGeneratedBadge: boolean;
  isSelected: boolean;
  hasPreviewOrCropped: boolean;
  onExpandClick: () => void;
  onCanvasPreviewClick: () => void;
}

const StyleCardIndicators = ({
  isPopular,
  showGeneratedBadge,
  isSelected,
  hasPreviewOrCropped,
  onExpandClick,
  onCanvasPreviewClick
}: StyleCardIndicatorsProps) => {
  // Return null to remove all overlay indicators
  return null;
};

export default StyleCardIndicators;
