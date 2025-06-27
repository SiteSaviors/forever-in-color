
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Maximize2 } from "lucide-react";

interface EnhancedStyleCardHoverActionsProps {
  isHovered: boolean;
  onCanvasPreview: (e: React.MouseEvent) => void;
  onLightboxOpen: (e: React.MouseEvent) => void;
}

const EnhancedStyleCardHoverActions = ({
  isHovered,
  onCanvasPreview,
  onLightboxOpen
}: EnhancedStyleCardHoverActionsProps) => {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-10 ${
      isHovered ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-2">
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/95 hover:bg-white backdrop-blur-sm shadow-xl border-0 transform transition-all duration-200 hover:scale-110"
            onClick={onCanvasPreview}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/95 hover:bg-white backdrop-blur-sm shadow-xl border-0 transform transition-all duration-200 hover:scale-110"
            onClick={onLightboxOpen}
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            Full Size
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStyleCardHoverActions;
