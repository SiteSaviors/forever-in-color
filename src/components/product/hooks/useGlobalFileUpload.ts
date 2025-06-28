
import { useState, useEffect, useCallback } from 'react';
import { fileInputManager } from '@/utils/fileInputManager';

interface UseGlobalFileUploadProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  onImageAnalysis?: (imageUrl: string) => void;
  onFlowStageChange?: (stage: 'upload' | 'analyzing' | 'crop-preview' | 'orientation' | 'complete') => void;
}

export const useGlobalFileUpload = ({
  onImageUpload,
  onImageAnalysis,
  onFlowStageChange
}: UseGlobalFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

  const handleFileSelection = useCallback(async (file: File) => {
    console.log('🎯 useGlobalFileUpload: File selected:', file.name);
    
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStage('Uploading your photo...');
    onFlowStageChange?.('upload');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create object URL for the file
      const imageUrl = URL.createObjectURL(file);
      
      // Complete upload progress
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setProcessingStage('Processing complete!');
        
        // Trigger image analysis
        setTimeout(() => {
          onImageAnalysis?.(imageUrl);
          setIsUploading(false);
        }, 500);
      }, 1000);

    } catch (error) {
      console.error('Error processing file:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setProcessingStage('');
    }
  }, [onImageUpload, onImageAnalysis, onFlowStageChange]);

  // Register the file change callback when component mounts
  useEffect(() => {
    fileInputManager.setFileChangeCallback(handleFileSelection);
    
    return () => {
      fileInputManager.clearFileChangeCallback();
    };
  }, [handleFileSelection]);

  const triggerFileInput = useCallback(() => {
    console.log('🎯 useGlobalFileUpload: Triggering file input');
    return fileInputManager.triggerFileInput();
  }, []);

  return {
    isUploading,
    uploadProgress,
    processingStage,
    triggerFileInput
  };
};
