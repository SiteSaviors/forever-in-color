import { PhotoAnalysisResult } from '../photoAnalysis/types';
import { SmartRecommendation, ContextualFactors, UserPreference } from './types';

interface UserBehaviorPattern {
  preferredStyles: number[];
  avgSessionTime: number;
  completionRate: number;
  colorPreferences: string[];
  orientationPreferences: string[];
  complexityPreferences: string[];
  timeOfDayPatterns: { [hour: number]: number[] };
  deviceTypePatterns: { mobile: number[], desktop: number[] };
}

interface StylePerformanceMetrics {
  conversionRate: number;
  userSatisfactionScore: number;
  completionTime: number;
  shareRate: number;
  reorderRate: number;
}

export class MLRecommendationEngine {
  private userBehaviorCache = new Map<string, UserBehaviorPattern>();
  private globalStyleMetrics = new Map<number, StylePerformanceMetrics>();
  private realTimeEvents: Array<{ timestamp: number; userId: string; styleId: number; action: string }> = [];
  
  constructor() {
    this.initializeGlobalMetrics();
    this.loadUserBehaviorPatterns();
  }

  generateRecommendations(
    analysis: PhotoAnalysisResult, 
    contextualFactors: ContextualFactors,
    userId?: string
  ): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Get user-specific behavior patterns
    const userPattern = userId ? this.getUserBehaviorPattern(userId) : null;
    
    // Calculate recommendations for each style
    Object.entries(analysis.styleAffinities).forEach(([styleIdStr, baseAffinity]) => {
      const styleId = parseInt(styleIdStr);
      if (styleId === 1) return; // Skip original image
      
      const recommendation = this.generateStyleRecommendation(
        styleId,
        baseAffinity,
        analysis,
        contextualFactors,
        userPattern
      );
      
      if (recommendation.confidence > 0.3) {
        recommendations.push(recommendation);
      }
    });
    
    // Sort by confidence and apply diversity filtering
    const sortedRecs = recommendations.sort((a, b) => b.confidence - a.confidence);
    const diverseRecs = this.applyDiversityFiltering(sortedRecs, analysis);
    
    // Add trending and discovery recommendations
    const enhancedRecs = this.addTrendingAndDiscovery(diverseRecs, contextualFactors, userPattern);
    
    return enhancedRecs.slice(0, 8); // Return top 8 recommendations
  }

  private generateStyleRecommendation(
    styleId: number,
    baseAffinity: number,
    analysis: PhotoAnalysisResult,
    contextualFactors: ContextualFactors,
    userPattern: UserBehaviorPattern | null
  ): SmartRecommendation {
    let confidence = baseAffinity;
    let reason = this.getBaseReasonForStyle(styleId, analysis);
    let category: 'ai-perfect' | 'personal' | 'trending' | 'discovery' = 'ai-perfect';
    
    // Apply ML-based adjustments
    confidence = this.applyUserPersonalization(confidence, styleId, userPattern);
    confidence = this.applyContextualBoosts(confidence, styleId, contextualFactors);
    confidence = this.applyGlobalTrends(confidence, styleId);
    confidence = this.applyRealTimeSignals(confidence, styleId);
    
    // Determine category based on confidence source
    if (userPattern?.preferredStyles.includes(styleId)) {
      category = 'personal';
      reason = this.enhanceReasonWithPersonalization(reason, userPattern);
    } else if (this.isCurrentlyTrending(styleId)) {
      category = 'trending';
      reason = this.enhanceReasonWithTrending(reason, styleId);
    } else if (this.isDiscoveryCandidate(styleId, userPattern)) {
      category = 'discovery';
      reason = this.enhanceReasonWithDiscovery(reason);
    }
    
    return {
      styleId,
      confidence: Math.min(confidence, 1.0),
      reason,
      category,
      metadata: {
        baseAffinity,
        personalizationBoost: userPattern ? 0.1 : 0,
        trendingBoost: this.getTrendingBoost(styleId),
        contextualBoost: this.getContextualBoost(styleId, contextualFactors),
        realTimeBoost: this.getRealTimeBoost(styleId)
      }
    };
  }

  private applyUserPersonalization(confidence: number, styleId: number, userPattern: UserBehaviorPattern | null): number {
    if (!userPattern) return confidence;
    
    let boost = 0;
    
    // Preferred styles boost
    if (userPattern.preferredStyles.includes(styleId)) {
      boost += 0.2;
    }
    
    // Color preference alignment
    const styleColorAffinity = this.getStyleColorAffinity(styleId);
    const colorAlignment = this.calculateColorAlignment(userPattern.colorPreferences, styleColorAffinity);
    boost += colorAlignment * 0.15;
    
    // Complexity preference alignment
    const styleComplexity = this.getStyleComplexity(styleId);
    if (userPattern.complexityPreferences.includes(styleComplexity)) {
      boost += 0.1;
    }
    
    // Time-based patterns
    const currentHour = new Date().getHours();
    if (userPattern.timeOfDayPatterns[currentHour]?.includes(styleId)) {
      boost += 0.08;
    }
    
    return confidence + boost;
  }

  private applyContextualBoosts(confidence: number, styleId: number, contextualFactors: ContextualFactors): number {
    let boost = 0;
    
    // Device type optimization
    if (contextualFactors.deviceType === 'mobile') {
      // Mobile users prefer simpler, faster-rendering styles
      const simpleFriendlyStyles = [2, 4, 5]; // Classic Oil, Watercolor, Pastel
      if (simpleFriendlyStyles.includes(styleId)) boost += 0.1;
    } else {
      // Desktop users can handle more complex styles
      const complexStyles = [6, 11, 13]; // Gemstone Poly, Electric Bloom, Abstract Fusion
      if (complexStyles.includes(styleId)) boost += 0.08;
    }
    
    // Time of day optimization
    const hour = contextualFactors.timeOfDay;
    if (hour >= 6 && hour <= 10) {
      // Morning: Bright, energetic styles
      const morningStyles = [9, 10, 11]; // Pop Art, Neon Splash, Electric Bloom
      if (morningStyles.includes(styleId)) boost += 0.06;
    } else if (hour >= 18 && hour <= 22) {
      // Evening: Calm, sophisticated styles
      const eveningStyles = [2, 4, 15]; // Classic Oil, Watercolor, Deco Luxe
      if (eveningStyles.includes(styleId)) boost += 0.06;
    }
    
    // First-time user optimization
    if (contextualFactors.isFirstTime) {
      // Show popular, proven styles to new users
      const beginnerFriendlyStyles = [2, 4, 5, 9]; // Most popular styles
      if (beginnerFriendlyStyles.includes(styleId)) boost += 0.12;
    }
    
    return confidence + boost;
  }

  private applyGlobalTrends(confidence: number, styleId: number): number {
    const metrics = this.globalStyleMetrics.get(styleId);
    if (!metrics) return confidence;
    
    let boost = 0;
    
    // High conversion rate boost
    if (metrics.conversionRate > 0.8) boost += 0.1;
    else if (metrics.conversionRate > 0.6) boost += 0.05;
    
    // User satisfaction boost
    if (metrics.userSatisfactionScore > 4.5) boost += 0.08;
    else if (metrics.userSatisfactionScore > 4.0) boost += 0.04;
    
    // Share rate boost (viral potential)
    if (metrics.shareRate > 0.3) boost += 0.06;
    
    // Reorder rate boost (customer loyalty)
    if (metrics.reorderRate > 0.4) boost += 0.05;
    
    return confidence + boost;
  }

  private applyRealTimeSignals(confidence: number, styleId: number): number {
    const recentEvents = this.realTimeEvents.filter(event => 
      Date.now() - event.timestamp < 3600000 && // Last hour
      event.styleId === styleId
    );
    
    if (recentEvents.length === 0) return confidence;
    
    let boost = 0;
    const completions = recentEvents.filter(e => e.action === 'completed').length;
    const selections = recentEvents.filter(e => e.action === 'selected').length;
    
    // Real-time popularity boost
    if (selections > 10) boost += 0.08;
    else if (selections > 5) boost += 0.04;
    
    // Real-time conversion boost
    const conversionRate = selections > 0 ? completions / selections : 0;
    if (conversionRate > 0.7) boost += 0.06;
    
    return confidence + boost;
  }

  private applyDiversityFiltering(recommendations: SmartRecommendation[], analysis: PhotoAnalysisResult): SmartRecommendation[] {
    const diverseRecs: SmartRecommendation[] = [];
    const usedCategories = new Set<string>();
    const usedComplexities = new Set<string>();
    
    for (const rec of recommendations) {
      const styleComplexity = this.getStyleComplexity(rec.styleId);
      const styleCategory = this.getStyleCategory(rec.styleId);
      
      // Ensure diversity in categories and complexities
      if (diverseRecs.length < 3 || 
          (!usedCategories.has(styleCategory) && diverseRecs.length < 6) ||
          (!usedComplexities.has(styleComplexity) && diverseRecs.length < 8)) {
        
        diverseRecs.push(rec);
        usedCategories.add(styleCategory);
        usedComplexities.add(styleComplexity);
      }
    }
    
    return diverseRecs;
  }

  private addTrendingAndDiscovery(
    recommendations: SmartRecommendation[], 
    contextualFactors: ContextualFactors,
    userPattern: UserBehaviorPattern | null
  ): SmartRecommendation[] {
    const enhanced = [...recommendations];
    
    // Add trending recommendation if not already present
    const trendingStyleId = this.getCurrentTrendingStyle();
    if (trendingStyleId && !enhanced.find(r => r.styleId === trendingStyleId)) {
      enhanced.push({
        styleId: trendingStyleId,
        confidence: 0.75,
        reason: `🔥 Trending now! ${this.getTrendingReason(trendingStyleId)}`,
        category: 'trending',
        metadata: { trendingBoost: 0.3 }
      });
    }
    
    // Add discovery recommendation for non-first-time users
    if (!contextualFactors.isFirstTime && userPattern) {
      const discoveryStyleId = this.getDiscoveryRecommendation(userPattern);
      if (discoveryStyleId && !enhanced.find(r => r.styleId === discoveryStyleId)) {
        enhanced.push({
          styleId: discoveryStyleId,
          confidence: 0.65,
          reason: `✨ New style discovery based on your taste`,
          category: 'discovery',
          metadata: { discoveryBoost: 0.2 }
        });
      }
    }
    
    return enhanced;
  }

  recordUserChoice(styleId: number, analysis: PhotoAnalysisResult, completed: boolean, userId?: string): void {
    // Record real-time event
    this.realTimeEvents.push({
      timestamp: Date.now(),
      userId: userId || 'anonymous',
      styleId,
      action: completed ? 'completed' : 'selected'
    });
    
    // Clean old events (keep last 24 hours)
    const dayAgo = Date.now() - 24 * 3600000;
    this.realTimeEvents = this.realTimeEvents.filter(event => event.timestamp > dayAgo);
    
    // Update user behavior pattern
    if (userId) {
      this.updateUserBehaviorPattern(userId, styleId, analysis, completed);
    }
    
    // Update global metrics
    this.updateGlobalStyleMetrics(styleId, completed);
  }

  private getUserBehaviorPattern(userId: string): UserBehaviorPattern | null {
    return this.userBehaviorCache.get(userId) || null;
  }

  private updateUserBehaviorPattern(userId: string, styleId: number, analysis: PhotoAnalysisResult, completed: boolean): void {
    let pattern = this.userBehaviorCache.get(userId) || {
      preferredStyles: [],
      avgSessionTime: 0,
      completionRate: 0,
      colorPreferences: [],
      orientationPreferences: [],
      complexityPreferences: [],
      timeOfDayPatterns: {},
      deviceTypePatterns: { mobile: [], desktop: [] }
    };
    
    // Update preferred styles
    if (completed && !pattern.preferredStyles.includes(styleId)) {
      pattern.preferredStyles.push(styleId);
    }
    
    // Update color preferences
    analysis.dominantColors.forEach(color => {
      if (!pattern.colorPreferences.includes(color)) {
        pattern.colorPreferences.push(color);
      }
    });
    
    // Update orientation preferences
    if (!pattern.orientationPreferences.includes(analysis.orientation)) {
      pattern.orientationPreferences.push(analysis.orientation);
    }
    
    // Update complexity preferences
    if (!pattern.complexityPreferences.includes(analysis.complexity)) {
      pattern.complexityPreferences.push(analysis.complexity);
    }
    
    // Update time patterns
    const hour = new Date().getHours();
    if (!pattern.timeOfDayPatterns[hour]) {
      pattern.timeOfDayPatterns[hour] = [];
    }
    if (completed && !pattern.timeOfDayPatterns[hour].includes(styleId)) {
      pattern.timeOfDayPatterns[hour].push(styleId);
    }
    
    this.userBehaviorCache.set(userId, pattern);
    
    // Persist to localStorage for demo purposes
    try {
      localStorage.setItem(`user_pattern_${userId}`, JSON.stringify(pattern));
    } catch (error) {
      console.warn('Could not persist user pattern:', error);
    }
  }

  private updateGlobalStyleMetrics(styleId: number, completed: boolean): void {
    const metrics = this.globalStyleMetrics.get(styleId) || {
      conversionRate: 0.5,
      userSatisfactionScore: 4.0,
      completionTime: 300,
      shareRate: 0.2,
      reorderRate: 0.3
    };
    
    // Update conversion rate (simple moving average)
    const currentConversions = completed ? 1 : 0;
    metrics.conversionRate = metrics.conversionRate * 0.95 + currentConversions * 0.05;
    
    // Simulate other metrics updates (in real app, these would come from actual data)
    if (completed) {
      metrics.userSatisfactionScore = Math.min(5.0, metrics.userSatisfactionScore + 0.01);
      metrics.shareRate = Math.min(1.0, metrics.shareRate + 0.005);
      metrics.reorderRate = Math.min(1.0, metrics.reorderRate + 0.003);
    }
    
    this.globalStyleMetrics.set(styleId, metrics);
  }

  private initializeGlobalMetrics(): void {
    // Initialize with realistic baseline metrics for each style
    const baselineMetrics = {
      2: { conversionRate: 0.78, userSatisfactionScore: 4.6, completionTime: 280, shareRate: 0.35, reorderRate: 0.42 },
      4: { conversionRate: 0.72, userSatisfactionScore: 4.4, completionTime: 260, shareRate: 0.28, reorderRate: 0.38 },
      5: { conversionRate: 0.68, userSatisfactionScore: 4.3, completionTime: 240, shareRate: 0.32, reorderRate: 0.35 },
      6: { conversionRate: 0.65, userSatisfactionScore: 4.2, completionTime: 320, shareRate: 0.25, reorderRate: 0.30 },
      7: { conversionRate: 0.58, userSatisfactionScore: 4.0, completionTime: 340, shareRate: 0.22, reorderRate: 0.28 },
      8: { conversionRate: 0.62, userSatisfactionScore: 4.1, completionTime: 300, shareRate: 0.20, reorderRate: 0.25 },
      9: { conversionRate: 0.75, userSatisfactionScore: 4.5, completionTime: 270, shareRate: 0.40, reorderRate: 0.33 },
      10: { conversionRate: 0.63, userSatisfactionScore: 4.1, completionTime: 290, shareRate: 0.30, reorderRate: 0.27 },
      11: { conversionRate: 0.70, userSatisfactionScore: 4.3, completionTime: 310, shareRate: 0.28, reorderRate: 0.31 },
      13: { conversionRate: 0.55, userSatisfactionScore: 3.9, completionTime: 360, shareRate: 0.18, reorderRate: 0.22 },
      15: { conversionRate: 0.67, userSatisfactionScore: 4.2, completionTime: 330, shareRate: 0.26, reorderRate: 0.29 }
    };
    
    Object.entries(baselineMetrics).forEach(([styleId, metrics]) => {
      this.globalStyleMetrics.set(parseInt(styleId), metrics);
    });
  }

  private loadUserBehaviorPatterns(): void {
    // Load cached user patterns from localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('user_pattern_')) {
          const userId = key.replace('user_pattern_', '');
          const pattern = JSON.parse(localStorage.getItem(key) || '{}');
          this.userBehaviorCache.set(userId, pattern);
        }
      }
    } catch (error) {
      console.warn('Could not load user patterns:', error);
    }
  }

  // Helper methods for style analysis
  private getBaseReasonForStyle(styleId: number, analysis: PhotoAnalysisResult): string {
    const reasons: { [key: number]: string } = {
      2: `Perfect for ${analysis.hasPortrait ? 'portraits' : 'this composition'} with rich, painterly textures`,
      4: `Soft watercolor style complements the ${analysis.brightness > 0.6 ? 'bright' : 'gentle'} lighting`,
      5: `Pastel tones enhance the ${analysis.dominantColors.join(' and ')} colors beautifully`,
      6: `Geometric style highlights the ${analysis.complexity} composition structure`,
      7: `3D storybook effect brings depth to your ${analysis.subjectType} subject`,
      8: `Charcoal technique emphasizes the dramatic ${analysis.contrast} contrast`,
      9: `Pop art style amplifies the vibrant ${analysis.dominantColors.join(' and ')} palette`,
      10: `Neon effects enhance the electric energy of your photo`,
      11: `Electric bloom creates stunning organic flow and movement`,
      13: `Abstract fusion transforms complexity into artistic expression`,
      15: `Art deco elegance complements the balanced composition`
    };
    
    return reasons[styleId] || `This style matches your photo's unique characteristics`;
  }

  private getStyleColorAffinity(styleId: number): string[] {
    const colorAffinities: { [key: number]: string[] } = {
      2: ['red', 'orange', 'yellow', 'brown'],
      4: ['blue', 'cyan', 'white', 'gray'],
      5: ['pink', 'white', 'yellow', 'purple'],
      6: ['purple', 'blue', 'green', 'cyan'],
      7: ['blue', 'yellow', 'red', 'green'],
      8: ['black', 'white', 'gray'],
      9: ['red', 'blue', 'yellow', 'green'],
      10: ['green', 'cyan', 'purple', 'pink'],
      11: ['purple', 'pink', 'blue', 'cyan'],
      13: ['blue', 'purple', 'cyan', 'red'],
      15: ['yellow', 'orange', 'red', 'brown']
    };
    
    return colorAffinities[styleId] || [];
  }

  private getStyleComplexity(styleId: number): string {
    const complexities: { [key: number]: string } = {
      2: 'moderate', 4: 'simple', 5: 'simple', 6: 'complex',
      7: 'moderate', 8: 'moderate', 9: 'complex', 10: 'complex',
      11: 'complex', 13: 'complex', 15: 'moderate'
    };
    
    return complexities[styleId] || 'moderate';
  }

  private getStyleCategory(styleId: number): string {
    const categories: { [key: number]: string } = {
      2: 'classic', 4: 'artistic', 5: 'soft', 6: 'geometric',
      7: 'playful', 8: 'dramatic', 9: 'vibrant', 10: 'electric',
      11: 'organic', 13: 'abstract', 15: 'elegant'
    };
    
    return categories[styleId] || 'artistic';
  }

  private calculateColorAlignment(userColors: string[], styleColors: string[]): number {
    if (userColors.length === 0 || styleColors.length === 0) return 0;
    
    const intersection = userColors.filter(color => styleColors.includes(color));
    return intersection.length / Math.max(userColors.length, styleColors.length);
  }

  private isCurrentlyTrending(styleId: number): boolean {
    const metrics = this.globalStyleMetrics.get(styleId);
    return metrics ? metrics.conversionRate > 0.7 && metrics.shareRate > 0.3 : false;
  }

  private getCurrentTrendingStyle(): number | null {
    let topStyleId = null;
    let topScore = 0;
    
    this.globalStyleMetrics.forEach((metrics, styleId) => {
      const trendScore = metrics.conversionRate * 0.4 + metrics.shareRate * 0.6;
      if (trendScore > topScore) {
        topScore = trendScore;
        topStyleId = styleId;
      }
    });
    
    return topStyleId;
  }

  private getTrendingReason(styleId: number): string {
    const reasons: { [key: number]: string } = {
      2: "Classic Oil is the #1 choice this week",
      4: "Watercolor Dreams is loved by 90% of users",
      5: "Pastel Bliss is perfect for holiday sharing",
      9: "Pop Art Burst is viral on social media"
    };
    
    return reasons[styleId] || "This style is gaining popularity";
  }

  private isDiscoveryCandidate(styleId: number, userPattern: UserBehaviorPattern | null): boolean {
    if (!userPattern) return false;
    return !userPattern.preferredStyles.includes(styleId) && userPattern.preferredStyles.length > 2;
  }

  private getDiscoveryRecommendation(userPattern: UserBehaviorPattern): number | null {
    const allStyles = [2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15];
    const unexplored = allStyles.filter(styleId => !userPattern.preferredStyles.includes(styleId));
    
    if (unexplored.length === 0) return null;
    
    // Return style with best global metrics that user hasn't tried
    let bestStyleId = null;
    let bestScore = 0;
    
    unexplored.forEach(styleId => {
      const metrics = this.globalStyleMetrics.get(styleId);
      if (metrics) {
        const score = metrics.userSatisfactionScore * 0.7 + metrics.conversionRate * 0.3;
        if (score > bestScore) {
          bestScore = score;
          bestStyleId = styleId;
        }
      }
    });
    
    return bestStyleId;
  }

  private getTrendingBoost(styleId: number): number {
    return this.isCurrentlyTrending(styleId) ? 0.1 : 0;
  }

  private getContextualBoost(styleId: number, contextualFactors: ContextualFactors): number {
    let boost = 0;
    const hour = contextualFactors.timeOfDay;
    
    if (hour >= 6 && hour <= 10 && [9, 10, 11].includes(styleId)) boost += 0.06;
    if (hour >= 18 && hour <= 22 && [2, 4, 15].includes(styleId)) boost += 0.06;
    if (contextualFactors.deviceType === 'mobile' && [2, 4, 5].includes(styleId)) boost += 0.05;
    
    return boost;
  }

  private getRealTimeBoost(styleId: number): number {
    const recentSelections = this.realTimeEvents
      .filter(e => e.styleId === styleId && e.action === 'selected' && Date.now() - e.timestamp < 3600000)
      .length;
    
    return Math.min(recentSelections * 0.01, 0.08);
  }

  private enhanceReasonWithPersonalization(reason: string, userPattern: UserBehaviorPattern): string {
    return `${reason} • Matches your style preferences`;
  }

  private enhanceReasonWithTrending(reason: string, styleId: number): string {
    return `${reason} • ${this.getTrendingReason(styleId)}`;
  }

  private enhanceReasonWithDiscovery(reason: string): string {
    return `${reason} • Discover something new based on your taste`;
  }
}
