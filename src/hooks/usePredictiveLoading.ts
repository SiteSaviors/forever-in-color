
import { useEffect, useRef, useState } from 'react';
import { photoAnalysisEngine, PhotoAnalysisResult } from '@/utils/photoAnalysisEngine';
import { smartRecommendationEngine, SmartRecommendation } from '@/utils/smartRecommendations';

interface PredictiveLoadingState {
  isAnalyzing: boolean;
  isPreloading: boolean;
  recommendations: SmartRecommendation[];
  preloadedStyles: Set<number>;
  analysisResult: PhotoAnalysisResult | null;
}

interface UsePredictiveLoadingOptions {
  enablePreloading?: boolean;
  maxPreloadStyles?: number;
  analysisDelay?: number;
}

export const usePredictiveLoading = (
  imageUrl: string | null,
  options: UsePredictiveLoadingOptions = {}
) => {
  const {
    enablePreloading = true,
    maxPreloadStyles = 3,
    analysisDelay = 500
  } = options;

  const [state, setState] = useState<PredictiveLoadingState>({
    isAnalyzing: false,
    isPreloading: false,
    recommendations: [],
    preloadedStyles: new Set(),
    analysisResult: null
  });

  const analysisTimeoutRef = useRef<NodeJS.Timeout>();
  const preloadQueueRef = useRef<number[]>([]);
  const abortControllerRef = useRef<AbortController>();

  // Main effect to trigger analysis when image changes
  useEffect(() => {
    if (!imageUrl) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        recommendations: [],
        analysisResult: null
      }));
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

    // Start analysis with delay to avoid excessive calls
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
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
      console.log('🚀 Starting predictive analysis for image...');
      
      // Analyze the photo
      const analysisResult = await photoAnalysisEngine.analyzePhoto(url);
      
      if (signal.aborted) return;

      // Generate smart recommendations
      const recommendations = smartRecommendationEngine.generateRecommendations(
        analysisResult,
        {
          timeOfDay: new Date().getHours(),
          isFirstTime: !localStorage.getItem('artify_user_preferences'),
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
        }
      );

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        recommendations,
        analysisResult
      }));

      // Start predictive preloading
      if (enablePreloading) {
        startPredictivePreloading(recommendations.slice(0, maxPreloadStyles));
      }

    } catch (error) {
      if (!signal.aborted) {
        console.error('Analysis failed:', error);
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          recommendations: getFallbackRecommendations()
        }));
      }
    }
  };

  const startPredictivePreloading = async (recommendations: SmartRecommendation[]) => {
    setState(prev => ({ ...prev, isPreloading: true }));
    
    const stylesToPreload = recommendations
      .filter(rec => rec.confidence > 0.6) // Only preload high-confidence styles
      .map(rec => rec.styleId);

    console.log('🔮 Starting predictive preloading for styles:', stylesToPreload);
    
    preloadQueueRef.current = stylesToPreload;
    
    // Preload styles sequentially to avoid overwhelming the system
    for (const styleId of stylesToPreload) {
      if (abortControllerRef.current?.signal.aborted) break;
      
      try {
        await preloadStyleResources(styleId);
        
        setState(prev => ({
          ...prev,
          preloadedStyles: new Set([...prev.preloadedStyles, styleId])
        }));
        
        // Small delay between preloads
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.warn(`Failed to preload style ${styleId}:`, error);
      }
    }
    
    setState(prev => ({ ...prev, isPreloading: false }));
    console.log('✅ Predictive preloading completed');
  };

  const preloadStyleResources = async (styleId: number): Promise<void> => {
    // Preload style-specific resources
    const preloadPromises: Promise<void>[] = [];
    
    // Preload style preview images
    const styleImageUrl = getStyleImageUrl(styleId);
    if (styleImageUrl) {
      preloadPromises.push(preloadImage(styleImageUrl));
    }
    
    // Preload related canvas mockup images
    const mockupImageUrl = getCanvasMockupUrl(styleId);
    if (mockupImageUrl) {
      preloadPromises.push(preloadImage(mockupImageUrl));
    }
    
    // Simulate API warmup (in real app, this could pre-warm AI generation endpoints)
    preloadPromises.push(warmupStyleAPI(styleId));
    
    await Promise.allSettled(preloadPromises);
  };

  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
      
      // Timeout after 3 seconds
      setTimeout(() => reject(new Error('Preload timeout')), 3000);
    });
  };

  const warmupStyleAPI = async (styleId: number): Promise<void> => {
    // Simulate API warmup - could send a small warmup request
    return new Promise(resolve => setTimeout(resolve, 100));
  };

  const getStyleImageUrl = (styleId: number): string | null => {
    // Map style IDs to their preview images
    const styleImages: { [key: number]: string } = {
      2: '/images/styles/classic-oil-preview.jpg',
      4: '/images/styles/watercolor-preview.jpg',
      5: '/images/styles/pastel-preview.jpg',
      8: '/images/styles/charcoal-preview.jpg',
      9: '/images/styles/pop-art-preview.jpg'
    };
    
    return styleImages[styleId] || null;
  };

  const getCanvasMockupUrl = (styleId: number): string | null => {
    return `/images/canvas-mockups/style-${styleId}.jpg`;
  };

  const getFallbackRecommendations = (): SmartRecommendation[] => {
    return [
      {
        styleId: 2,
        confidence: 0.8,
        reason: 'Classic choice that works beautifully with any photo',
        category: 'ai-perfect',
        urgency: 'high'
      },
      {
        styleId: 4,
        confidence: 0.7,
        reason: 'Popular watercolor style for artistic appeal',
        category: 'trending',
        urgency: 'medium'
      },
      {
        styleId: 5,
        confidence: 0.6,
        reason: 'Gentle pastel style for a dreamy look',
        category: 'discovery',
        urgency: 'low'
      }
    ];
  };

  // Public methods for external components
  const recordStyleInteraction = (styleId: number, completed: boolean = false) => {
    if (state.analysisResult) {
      smartRecommendationEngine.recordUserChoice(
        styleId, 
        state.analysisResult, 
        completed
      );
    }
  };

  const isStylePreloaded = (styleId: number): boolean => {
    return state.preloadedStyles.has(styleId);
  };

  const getRecommendationForStyle = (styleId: number): SmartRecommendation | undefined => {
    return state.recommendations.find(rec => rec.styleId === styleId);
  };

  return {
    // State
    isAnalyzing: state.isAnalyzing,
    isPreloading: state.isPreloading,
    recommendations: state.recommendations,
    analysisResult: state.analysisResult,
    
    // Methods
    recordStyleInteraction,
    isStylePreloaded,
    getRecommendationForStyle,
    
    // Computed values
    hasRecommendations: state.recommendations.length > 0,
    topRecommendation: state.recommendations[0] || null,
    confidenceScore: state.analysisResult?.confidence || 0
  };
};

export default usePredictiveLoading;
