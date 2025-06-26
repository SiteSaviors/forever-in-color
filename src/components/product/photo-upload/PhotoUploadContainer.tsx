import PhotoUploadMain from "./components/PhotoUploadMain";
import { ImageCompressor } from "@/utils/imageCompression";
import { IntelligentPreloader } from "@/utils/performanceUtils";
import { useEffect, useState } from "react";

interface PhotoUploadContainerProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  initialImage?: string | null;
}

const PhotoUploadContainer = ({
  onImageUpload,
  initialImage
}: PhotoUploadContainerProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  useEffect(() => {
    // Preload compression worker and popular styles
    IntelligentPreloader.preloadPopularStyles();
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setIsCompressing(true);
      setCompressionProgress(0);

      // Simulate compression progress
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Compress image with intelligent settings
      const compressedFile = await ImageCompressor.compressImage(file, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.85,
        enableWorker: true,
        progressive: true
      });

      clearInterval(progressInterval);
      setCompressionProgress(100);

      // Create URLs for both original and compressed
      const originalUrl = URL.createObjectURL(file);
      const compressedUrl = URL.createObjectURL(compressedFile);

      console.log('Image compression complete:', {
        originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
        compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
      });

      // Use compressed image but keep original as backup
      onImageUpload(compressedUrl, originalUrl);

      // Clean up progress
      setTimeout(() => {
        setIsCompressing(false);
        setCompressionProgress(0);
      }, 500);

    } catch (error) {
      console.error('Image compression failed:', error);
      
      // Fallback to original file
      const originalUrl = URL.createObjectURL(file);
      onImageUpload(originalUrl);
      
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  return (
    <div className="w-full">
      <PhotoUploadMain 
        onImageUpload={handleFileUpload}
        initialImage={initialImage}
      />
      
      {/* Compression Progress Indicator */}
      {isCompressing && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Optimizing image for best performance...
            </span>
            <span className="text-sm text-blue-600">
              {compressionProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${compressionProgress}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Reducing file size while maintaining quality for faster uploads and previews
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadContainer;
