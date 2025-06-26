
import { useState, useCallback } from "react";
import PhotoUploadMain from "./components/PhotoUploadMain";
import { validateImageFile } from "@/utils/fileValidation";
import { compressImage } from "@/utils/imageCompression";

interface PhotoUploadContainerProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  initialImage?: string | null;
}

const PhotoUploadContainer = ({ onImageUpload, initialImage }: PhotoUploadContainerProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Enhanced file upload handler with better error handling
  const handleFileUpload = useCallback(async (file: File) => {
    console.log('📁 PhotoUploadContainer: Starting file upload for:', file.name);
    
    // Reset previous states
    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(true);

    try {
      // Enhanced validation with specific error messages
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file format');
      }

      console.log('✅ File validation passed');
      setUploadProgress(20);

      // Compress image with progress tracking
      console.log('🔄 Starting image compression...');
      const compressedFile = await compressImage(file, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.9,
        onProgress: (progress) => {
          setUploadProgress(20 + (progress * 0.6)); // 20-80% for compression
        }
      });

      console.log('✅ Image compression completed');
      setUploadProgress(80);

      // Create object URLs for both original and compressed
      const originalImageUrl = URL.createObjectURL(file);
      const compressedImageUrl = URL.createObjectURL(compressedFile);
      
      setUploadProgress(100);
      
      console.log('🎯 Calling onImageUpload with compressed image');
      
      // Call the upload callback with compressed image
      onImageUpload(compressedImageUrl, originalImageUrl);
      
      console.log('✅ File upload completed successfully');

    } catch (error) {
      console.error('❌ File upload failed:', error);
      
      // Enhanced error handling with specific error types
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('format')) {
          errorMessage = 'Please upload a valid image file (JPG, PNG, or WebP)';
        } else if (error.message.includes('size')) {
          errorMessage = 'File is too large. Please choose an image under 10MB';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again';
        } else {
          errorMessage = error.message;
        }
      }
      
      setUploadError(errorMessage);
      
      // Reset progress on error
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload]);

  // Enhanced drag handlers with validation
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if dragged items contain files
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
      if (hasFiles) {
        setDragActive(true);
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer?.files || []);
    
    if (files.length === 0) {
      setUploadError('No files were dropped');
      return;
    }

    if (files.length > 1) {
      setUploadError('Please upload one image at a time');
      return;
    }

    const file = files[0];
    
    // Quick validation before processing
    if (!file.type.startsWith('image/')) {
      setUploadError('Please drop an image file');
      return;
    }

    handleFileUpload(file);
  }, [handleFileUpload]);

  // Clear error handler
  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  console.log('🔄 PhotoUploadContainer render:', {
    isUploading,
    uploadProgress,
    uploadError: !!uploadError,
    dragActive,
    initialImage: !!initialImage
  });

  return (
    <div 
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <PhotoUploadMain
        onFileUpload={handleFileUpload}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        uploadError={uploadError}
        dragActive={dragActive}
        initialImage={initialImage}
        onClearError={clearError}
      />
    </div>
  );
};

export default PhotoUploadContainer;
