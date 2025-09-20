
import { useState, useRef } from "react";
import { validateImageFile } from "@/utils/fileValidation";
import { detectOrientationFromImage } from "../../utils/orientationDetection";

interface UsePhotoUploadLogicProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  initialImage?: string | null;
  onImageAnalysis: (imageUrl: string) => void;
  onFlowStageChange: (stage: 'upload' | 'analyzing' | 'crop-preview' | 'orientation' | 'complete') => void;
}

export const usePhotoUploadLogic = ({
  onImageUpload,
  initialImage,
  onImageAnalysis,
  onFlowStageChange
}: UsePhotoUploadLogicProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage || null);
  const [processingStage, setProcessingStage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateProcessingStages = () => {
    const stages = [
      { message: "Uploading your photo...", progress: 20 },
      { message: "Analyzing composition...", progress: 50 },
      { message: "Detecting optimal crop...", progress: 80 },
      { message: "Preparing smart suggestions...", progress: 95 }
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setProcessingStage(stage.message);
        setUploadProgress(stage.progress);
      }, (index + 1) * 400);
    });
  };

  const handleFileSelect = async (file: File) => {
    const validationResult = await validateImageFile(file);
    if (!validationResult.isValid) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    onFlowStageChange('analyzing');
    
    simulateProcessingStages();

    try {
      const imageUrl = URL.createObjectURL(file);
      
      setTimeout(() => {
        setUploadedImage(imageUrl);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setProcessingStage("");
          onImageAnalysis(imageUrl);
        }, 800);
      }, 2000);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      setProcessingStage("");
      onFlowStageChange('upload');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleChangePhoto = () => {
    setUploadedImage(null);
    setProcessingStage("");
    setUploadProgress(0);
    onFlowStageChange('upload');
    fileInputRef.current?.click();
  };

  return {
    isDragOver,
    isUploading,
    uploadProgress,
    uploadedImage,
    processingStage,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleClick,
    handleFileChange,
    handleChangePhoto,
    setUploadedImage
  };
};
