
import { useMemo, useCallback } from "react";
import { SizeOption } from "../types";

interface UsePsychologicalOptimizationProps {
  sizeOptions: SizeOption[];
  selectedSize: string;
  userImageUrl?: string | null;
}

export const usePsychologicalOptimization = ({
  sizeOptions,
  selectedSize,
  userImageUrl
}: UsePsychologicalOptimizationProps) => {
  
  // Goldilocks Method: Identify the "sweet spot" options
  const goldilocksSizes = useMemo(() => {
    if (!sizeOptions || sizeOptions.length === 0) return [];
    
    // Sort by price to identify good, better, best
    const sortedOptions = [...sizeOptions].sort((a, b) => a.salePrice - b.salePrice);
    
    // For 6 options, show 3-4 core choices prominently
    if (sortedOptions.length >= 6) {
      return [
        { ...sortedOptions[1], tier: 'good', label: 'Great Value' },
        { ...sortedOptions[2], tier: 'better', label: 'Most Popular', isRecommended: true },
        { ...sortedOptions[3], tier: 'best', label: 'Premium Choice' }
      ];
    }
    
    // For fewer options, adapt accordingly
    return sortedOptions.map((option, index) => ({
      ...option,
      tier: index === 0 ? 'good' : index === sortedOptions.length - 1 ? 'best' : 'better',
      label: index === Math.floor(sortedOptions.length / 2) ? 'Most Popular' : '',
      isRecommended: index === Math.floor(sortedOptions.length / 2)
    }));
  }, [sizeOptions]);

  // Confidence Cascade: Progressive information revelation
  const getConfidenceData = useCallback((size: string) => {
    const sizeMap = {
      '16" x 16"': {
        roomFit: 'Perfect for bedrooms, offices, and cozy spaces',
        popularity: '68% of customers choose this size',
        socialProof: '2,847 happy customers',
        lifestyle: 'Ideal for personal spaces and intimate settings'
      },
      '24" x 18"': {
        roomFit: 'Great for living rooms and main walls',
        popularity: '74% of customers love this size',
        socialProof: '4,231 happy customers',
        lifestyle: 'Perfect statement piece for any room'
      },
      '36" x 24"': {
        roomFit: 'Stunning focal point for large spaces',
        popularity: '52% choose this for living rooms',
        socialProof: '1,923 happy customers',
        lifestyle: 'Gallery-worthy art for sophisticated spaces'
      }
    };
    
    return sizeMap[size as keyof typeof sizeMap] || {
      roomFit: 'Beautiful addition to any space',
      popularity: 'Popular choice among customers',
      socialProof: 'Loved by many customers',
      lifestyle: 'Perfect for your home'
    };
  }, []);

  // Emotional Triggers: Personalized messaging
  const getEmotionalTriggers = useCallback((size: string, isSelected: boolean) => {
    const baseMessages = [
      "Transform your space with this perfect size",
      "This size will make your photo truly shine",
      "Create a stunning focal point in your room"
    ];

    const selectedMessages = [
      "Excellent choice! This will look amazing in your space",
      "Perfect! This size captures every beautiful detail",
      "Great selection - your photo deserves this quality"
    ];

    return isSelected ? selectedMessages : baseMessages;
  }, []);

  // Smart defaults based on image analysis
  const getSmartDefault = useCallback(() => {
    if (!userImageUrl) return goldilocksSizes[1]?.size || '';
    
    // Simulate AI analysis - in production, this would analyze image composition
    // For now, default to the "better" tier (most popular)
    return goldilocksSizes.find(option => option.tier === 'better')?.size || goldilocksSizes[0]?.size || '';
  }, [userImageUrl, goldilocksSizes]);

  // Urgency and scarcity elements
  const getUrgencyElements = useCallback((size: string) => {
    const urgencyData = {
      '16" x 16"': { viewers: 3, recentOrders: 12, timeFrame: 'last hour' },
      '24" x 18"': { viewers: 5, recentOrders: 18, timeFrame: 'last hour' },
      '36" x 24"': { viewers: 2, recentOrders: 8, timeFrame: 'last 2 hours' }
    };
    
    return urgencyData[size as keyof typeof urgencyData] || { 
      viewers: Math.floor(Math.random() * 4) + 1, 
      recentOrders: Math.floor(Math.random() * 15) + 5, 
      timeFrame: 'last hour' 
    };
  }, []);

  return {
    goldilocksSizes,
    getConfidenceData,
    getEmotionalTriggers,
    getSmartDefault,
    getUrgencyElements
  };
};
