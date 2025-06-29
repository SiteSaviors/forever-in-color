
import { memo } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Play } from "lucide-react";

interface EnhancedStyleCardContentProps {
  styleName: string;
  description: string;
  isSelected: boolean;
  hasPreview: boolean;
  onSelect: () => void;
  onGenerate?: () => void;
}

const EnhancedStyleCardContent = memo(({
  styleName,
  description,
  isSelected,
  hasPreview,
  onSelect,
  onGenerate
}: EnhancedStyleCardContentProps) => {
  return (
    <CardContent className="p-4">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{styleName}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            onClick={onSelect}
            className="flex-1"
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
          
          {!hasPreview && onGenerate && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onGenerate}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Generate
            </Button>
          )}
          
          {hasPreview && (
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              Preview
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  );
});

EnhancedStyleCardContent.displayName = 'EnhancedStyleCardContent';

export default EnhancedStyleCardContent;
