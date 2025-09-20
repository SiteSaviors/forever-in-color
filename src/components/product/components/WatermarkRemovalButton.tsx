
import React from 'react';
import { Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WatermarkRemovalButtonProps {
  onRemoveWatermark: () => void;
  isGenerating?: boolean;
  className?: string;
}

const WatermarkRemovalButton: React.FC<WatermarkRemovalButtonProps> = ({
  onRemoveWatermark,
  isGenerating = false,
  className = ""
}) => {
  return (
    <Button
      onClick={onRemoveWatermark}
      disabled={isGenerating}
      className={`
        w-full bg-gradient-to-r from-green-600 to-emerald-600 
        hover:from-green-700 hover:to-emerald-700 
        text-white shadow-md hover:shadow-lg 
        transition-all duration-200 
        ${className}
      `}
      size="sm"
    >
      <Download className="w-4 h-4 mr-2" />
      {isGenerating ? (
        <>
          <Zap className="w-4 h-4 mr-1 animate-pulse" />
          Removing...
        </>
      ) : (
        'Remove Watermark'
      )}
    </Button>
  );
};

export default WatermarkRemovalButton;
