
import { UserPreference } from '../types';
import { PhotoAnalysisResult } from '../../photoAnalysis/types';

export class UserPreferencesManager {
  private userPreferences: Map<string, UserPreference>;

  constructor() {
    this.userPreferences = new Map();
    this.loadPersistedPreferences();
  }

  getUserPreferences(): Map<string, UserPreference> {
    return this.userPreferences;
  }

  getUserPreference(userId: string): UserPreference | null {
    return this.userPreferences.get(userId) || null;
  }

  updateUserPreferences(
    userId: string,
    styleId: number,
    analysis: PhotoAnalysisResult,
    completed: boolean
  ): void {
    let preferences = this.userPreferences.get(userId) || this.createDefaultPreference(styleId, analysis);

    // Update preferences based on user action
    if (completed && !preferences.favoriteStyles.includes(styleId)) {
      preferences.favoriteStyles.push(styleId);
    }

    // Update color preferences
    analysis.dominantColors.forEach(color => {
      if (!preferences.colorPreferences.includes(color)) {
        preferences.colorPreferences.push(color);
      }
    });

    // Update other preferences
    preferences.complexityPreference = analysis.complexity;
    preferences.orientationPreference = analysis.orientation;
    preferences.lastInteraction = Date.now();
    preferences.totalInteractions++;

    // Calculate completion rate
    const completions = preferences.favoriteStyles.length;
    preferences.completionRate = completions / preferences.totalInteractions;

    this.userPreferences.set(userId, preferences);
    this.persistUserPreference(userId, preferences);
  }

  private createDefaultPreference(styleId: number, analysis: PhotoAnalysisResult): UserPreference {
    return {
      styleId,
      frequency: 0,
      satisfaction: 0,
      context: {
        imageType: analysis.subjectType,
        orientation: analysis.orientation,
        timeOfDay: new Date().getHours()
      },
      favoriteStyles: [],
      colorPreferences: [],
      complexityPreference: 'moderate' as const,
      orientationPreference: 'square' as const,
      lastInteraction: Date.now(),
      totalInteractions: 0,
      completionRate: 0
    };
  }

  private loadPersistedPreferences(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('user_pref_')) {
          const userId = key.replace('user_pref_', '');
          const preferences = JSON.parse(localStorage.getItem(key) || '{}');
          this.userPreferences.set(userId, preferences);
        }
      }
      console.log(`✅ Loaded ${this.userPreferences.size} user preference profiles`);
    } catch (error) {
      console.warn('Could not load persisted preferences:', error);
    }
  }

  private persistUserPreference(userId: string, preferences: UserPreference): void {
    try {
      localStorage.setItem(`user_pref_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Could not persist user preferences:', error);
    }
  }

  clearUserPreferences(): void {
    this.userPreferences.clear();
    // Clear from localStorage
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('user_pref_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Could not clear persisted preferences:', error);
    }
  }
}
