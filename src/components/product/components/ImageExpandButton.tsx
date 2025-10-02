
import React from 'react';
import { Expand } from '@/components/ui/icons';

interface ImageExpandButtonProps {
  onExpand: (e: React.MouseEvent) => void;
  isVisible: boolean;
  className?: string;
}

const ImageExpandButton = ({ onExpand, isVisible, className = '' }: ImageExpandButtonProps) => {
  return (
    <button
      onClick={onExpand}
      className={`
        absolute top-2 right-2 z-10 
        bg-black/50 hover:bg-black/70 
        text-white rounded-full p-2 
        transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        backdrop-blur-sm
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
        ${className}
      `}
      aria-label="Expand image preview"
      title="Click to expand image"
    >
      <Expand className="w-4 h-4" />
    </button>
  );
};

export default ImageExpandButton;
