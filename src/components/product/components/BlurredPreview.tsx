
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BlurredPreviewProps {
  originalImage: string;
  isLoading: boolean;
  className?: string;
}

const BlurredPreview = ({ originalImage, isLoading, className }: BlurredPreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = originalImage;
    }
  }, [originalImage]);

  if (!imageLoaded) {
    return (
      <div className={cn("bg-gray-100 animate-pulse", className)} />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={originalImage}
        alt="Preview"
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          isLoading ? "blur-sm scale-105 brightness-75" : "blur-0 scale-100 brightness-100"
        )}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
      )}
    </div>
  );
};

export default BlurredPreview;
