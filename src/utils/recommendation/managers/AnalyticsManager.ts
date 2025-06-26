
import { UserPreference } from '../types';

export interface RecommendationAnalytics {
  totalUsers: number;
  averageCompletionRate: number;
  topStyles: Array<{ styleId: number; count: number }>;
  colorTrends: Array<{ color: string; count: number }>;
}

export class AnalyticsManager {
  constructor(private userPreferences: Map<string, UserPreference>) {}

  getAnalytics(): RecommendationAnalytics {
    const users = Array.from(this.userPreferences.values());
    const totalUsers = users.length;
    
    const avgCompletionRate = users.length > 0 
      ? users.reduce((sum, user) => sum + user.completionRate, 0) / users.length 
      : 0;
    
    // Calculate top styles
    const styleCounts = new Map<number, number>();
    users.forEach(user => {
      user.favoriteStyles.forEach(styleId => {
        styleCounts.set(styleId, (styleCounts.get(styleId) || 0) + 1);
      });
    });
    
    const topStyles = Array.from(styleCounts.entries())
      .map(([styleId, count]) => ({ styleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate color trends
    const colorCounts = new Map<string, number>();
    users.forEach(user => {
      user.colorPreferences.forEach(color => {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      });
    });
    
    const colorTrends = Array.from(colorCounts.entries())
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    
    return {
      totalUsers,
      averageCompletionRate: avgCompletionRate,
      topStyles,
      colorTrends
    };
  }

  logInteraction(userId: string, action: string, metadata?: any): void {
    console.log(`📊 Analytics: User ${userId} performed ${action}`, metadata);
  }

  getEngagementMetrics(): {
    dailyActiveUsers: number;
    averageSessionDuration: number;
    conversionRate: number;
  } {
    const users = Array.from(this.userPreferences.values());
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const dailyActiveUsers = users.filter(user => user.lastInteraction > oneDayAgo).length;
    
    // Mock metrics for demo
    return {
      dailyActiveUsers,
      averageSessionDuration: 180000, // 3 minutes
      conversionRate: 0.35 // 35%
    };
  }
}
