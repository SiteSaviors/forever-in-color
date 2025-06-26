
import { useState, useEffect, useRef } from 'react';
import { photoAnalysisEngine, PhotoAnalysisResult } from '@/utils/photoAnalysisEngine';

interface UsePhotoAnalysisOptions {
  analysisDelay?: number;
}

export const usePhotoAnalysis = (
  imageUrl: string | null,
  options: UsePhotoAnalysisOptions = {}
) => {
  const { analysisDelay = 500 } = options;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PhotoAnalysisResult | null>(null);
  
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    if (!imageUrl) {
      setAnalysisResult(null);
      setIsAnalyzing(false);
      return;
    }

    // Cancel previous analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Clear previous timeout
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    setIsAnalyzing(true);
    
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
      console.log('🚀 Starting photo analysis...');
      
      const result = await photoAnalysisEngine.analyzePhoto(url);
      
      if (signal.aborted) return;

      setAnalysisResult(result);
      setIsAnalyzing(false);

    } catch (error) {
      if (!signal.aborted) {
        console.error('Photo analysis failed:', error);
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
