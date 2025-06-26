
import { UserPreference } from './types';
import { PhotoAnalysisResult } from '../photoAnalysis/types';

export class UserPreferencesManager {
  private userPreferences: UserPreference[] = [];

  constructor() {
    this.loadUserPreferences();
  }

  getUserPreferences(): UserPreference[] {
    return this.userPreferences;
  }

  recordUserChoice(styleId: number, imageAnalysis: PhotoAnalysisResult, completed: boolean): void {
    // Find existing preference
    const existingPref = this.userPreferences.find(p => 
      p.favoriteStyles.includes(styleId) ||
      (p.context.orientation === imageAnalysis.orientation &&
       p.context.imageType === imageAnalysis.subjectType)
    );
    
    if (existingPref) {
      existingPref.frequency++;
      existingPref.satisfaction = completed ? 
        Math.min(1, existingPref.satisfaction + 0.1) : 
        Math.max(0, existingPref.satisfaction - 0.1);
      
      if (completed && !existingPref.favoriteStyles.includes(styleId)) {
        existingPref.favoriteStyles.push(styleId);
      }
    } else {
      // Create new preference with all required properties
      const newPreference: UserPreference = {
        styleId,
        frequency: 1,
        satisfaction: completed ? 0.8 : 0.3,
        context: {
          imageType: imageAnalysis.subjectType,
          orientation: imageAnalysis.orientation,
          timeOfDay: new Date().getHours()
        },
        favoriteStyles: completed ? [styleId] : [],
        colorPreferences: imageAnalysis.dominantColors.slice(0, 3),
        complexityPreference: imageAnalysis.complexity,
        orientationPreference: imageAnalysis.orientation,
        lastInteraction: Date.now(),
        totalInteractions: 1,
        completionRate: completed ? 1.0 : 0.0
      };
      
      this.userPreferences.push(newPreference);
    }
    
    this.saveUserPreferences();
  }

  private loadUserPreferences(): void {
    try {
      const stored = localStorage.getItem('artify_user_preferences');
      if (stored) {
        this.userPreferences = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load user preferences:', error);
    }
  }

  private saveUserPreferences(): void {
    try {
      localStorage.setItem('artify_user_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.warn('Could not save user preferences:', error);
    }
  }
}
