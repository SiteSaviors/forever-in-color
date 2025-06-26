
import { useState, useEffect, useRef } from 'react';
import { photoAnalysisEngine, PhotoAnalysisResult } from '@/utils/photoAnalysisEngine';

interface UsePhotoAnalysisOptions {
  analysisDelay?: number;
}

export const usePhotoAnalysis = (
  imageUrl: string | null,
  options: UsePhotoAnalysisOptions = {}
) => {
  const { analysisDelay = 800 } = options; // Slightly longer delay for better UX
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PhotoAnalysisResult | null>(null);
  
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const lastImageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('🔍 usePhotoAnalysis: imageUrl changed to:', imageUrl);
    
    if (!imageUrl) {
      setAnalysisResult(null);
      setIsAnalyzing(false);
      lastImageUrlRef.current = null;
      return;
    }

    // Don't re-analyze the same image
    if (imageUrl === lastImageUrlRef.current && analysisResult) {
      console.log('🔍 usePhotoAnalysis: Same image with existing result, skipping analysis');
      return;
    }

    lastImageUrlRef.current = imageUrl;

    // Cancel previous analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Clear previous timeout
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    console.log('🚀 usePhotoAnalysis: Starting analysis for new image');
    setIsAnalyzing(true);
    setAnalysisResult(null); // Clear previous result
    
    analysisTimeoutRef.current = setTimeout(() => {
      performAnalysis(imageUrl, abortControllerRef.current!.signal);
    }, analysisDelay);

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [imageUrl, analysisDelay]);

  const performAnalysis = async (url: string, signal: AbortSignal) => {
    try {
      console.log('🔍 Performing photo analysis for:', url);
      
      const result = await photoAnalysisEngine.analyzePhoto(url);
      
      if (signal.aborted) {
        console.log('🔍 Photo analysis aborted');
        return;
      }

      console.log('✅ Photo analysis completed:', result);
      setAnalysisResult(result);
      setIsAnalyzing(false);

    } catch (error) {
      if (!signal.aborted) {
        console.error('❌ Photo analysis failed:', error);
        setIsAnalyzing(false);
      }
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    confidence: analysisResult?.confidence || 0
  };
};
