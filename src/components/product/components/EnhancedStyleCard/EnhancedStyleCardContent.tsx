
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface EnhancedStyleCardContentProps {
  styleName: string;
  isSelected: boolean;
  onContinue?: () => void;
}

const EnhancedStyleCardContent = ({
  styleName,
  isSelected,
  onContinue
}: EnhancedStyleCardContentProps) => {
  return (
    <div className="p-4 bg-gradient-to-r from-white to-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{styleName}</h4>
          {isSelected && (
            <Badge className="mt-2 bg-purple-600 text-white shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Selected
            </Badge>
          )}
        </div>
        
        {isSelected && onContinue && (
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 ml-3"
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedStyleCardContent;
