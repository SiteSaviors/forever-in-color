
import { useState, useEffect } from "react";
import { generateStylePreview } from "@/utils/stylePreviewApi";
import { useToast } from "@/hooks/use-toast";

interface UseStylePreviewProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  isPopular: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

export const useStylePreview = ({ 
  style, 
  croppedImage, 
  isPopular, 
  onStyleClick 
}: UseStylePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);
  const [autoGenerationAttempted, setAutoGenerationAttempted] = useState(false);
  const { toast } = useToast();

  // Check if style was already generated in this session
  const isStyleGenerated = () => {
    try {
      const generatedStyles = sessionStorage.getItem('generatedStyles');
      if (generatedStyles) {
        const styles = JSON.parse(generatedStyles);
        return styles.includes(style.id);
      }
    } catch (error) {
      console.error('Error reading generated styles:', error);
    }
    return false;
  };

  // Mark style as generated in session
  const markStyleAsGenerated = () => {
    try {
      const generatedStyles = sessionStorage.getItem('generatedStyles');
      let styles = generatedStyles ? JSON.parse(generatedStyles) : [];
      if (!styles.includes(style.id)) {
        styles.push(style.id);
        sessionStorage.setItem('generatedStyles', JSON.stringify(styles));
      }
    } catch (error) {
      console.error('Error saving generated styles:', error);
    }
  };

  // Get custom prompts from localStorage
  const getCustomPrompt = (styleId: number): string | undefined => {
    try {
      const savedPrompts = localStorage.getItem('stylePrompts');
      if (savedPrompts) {
        const prompts = JSON.parse(savedPrompts);
        return prompts[styleId];
      }
    } catch (error) {
      console.error('Error reading custom prompts:', error);
    }
    return undefined;
  };

  // Auto-generate previews for popular styles when image is uploaded
  useEffect(() => {
    const shouldAutoGenerate = croppedImage && 
                              isPopular && 
                              style.id !== 1 && // Skip Original Image
                              !hasGeneratedPreview && 
                              !previewUrl &&
                              !autoGenerationAttempted &&
                              !isLoading &&
                              !isStyleGenerated(); // Don't auto-generate if already generated

    if (shouldAutoGenerate) {
      console.log(`Auto-generating preview for ${style.name} (ID: ${style.id})`);
      setAutoGenerationAttempted(true);
      generatePreviewSilently();
    }
  }, [croppedImage, isPopular, style.id, hasGeneratedPreview, previewUrl, autoGenerationAttempted, isLoading]);

  const generatePreviewSilently = async () => {
    if (!croppedImage) return;

    setIsLoading(true);
    
    try {
      console.log(`Starting silent preview generation for ${style.name}`);
      
      const customPrompt = getCustomPrompt(style.id);
      console.log(`Using custom prompt for ${style.name}:`, customPrompt);
      
      const response = await generateStylePreview({
        imageData: croppedImage,
        styleId: style.id,
        styleName: style.name,
        customPrompt
      });

      console.log(`Silent generation response for ${style.name}:`, response.success);

      if (response.success) {
        setPreviewUrl(response.previewUrl);
        setHasGeneratedPreview(true);
        markStyleAsGenerated(); // Mark as generated
        console.log(`Preview generated successfully for ${style.name}`);
      } else {
        console.warn(`Silent preview generation failed for ${style.name}:`, response.error);
        // Don't throw error for silent generation - just log it
      }
    } catch (error) {
      console.error(`Error in silent preview generation for ${style.name}:`, error);
      // Silent failure for auto-generation
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (!croppedImage) return;

    // Check if this style was already generated in this session
    if (isStyleGenerated() && style.id !== 1) {
      toast({
        title: "Style Already Generated",
        description: "You've already generated this style in this session. Refresh the page to generate again.",
        variant: "destructive",
      });
      return;
    }

    // If it's a popular style or already has a preview, select immediately
    if (isPopular || hasGeneratedPreview) {
      onStyleClick(style);
      return;
    }

    // For other styles, generate preview using API
    setIsLoading(true);
    
    try {
      const customPrompt = getCustomPrompt(style.id);
      console.log(`Using custom prompt for ${style.name}:`, customPrompt);
      
      const response = await generateStylePreview({
        imageData: croppedImage,
        styleId: style.id,
        styleName: style.name,
        customPrompt
      });

      if (response.success) {
        setPreviewUrl(response.previewUrl);
        setHasGeneratedPreview(true);
        markStyleAsGenerated(); // Mark as generated
        onStyleClick(style);
        
        toast({
          title: "Style Preview Generated!",
          description: `Your photo has been transformed with ${style.name} style.`,
        });
      } else {
        throw new Error(response.error || 'Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating style preview:', error);
      toast({
        title: "Preview Generation Failed",
        description: "Please try again or select a different style.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    handleClick,
    isStyleGenerated: isStyleGenerated()
  };
};
