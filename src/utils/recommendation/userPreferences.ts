
import { UserPreference } from './types';
import { PhotoAnalysisResult } from '../photoAnalysisEngine';

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
      p.styleId === styleId &&
      p.context.orientation === imageAnalysis.orientation &&
      p.context.imageType === imageAnalysis.subjectType
    );
    
    if (existingPref) {
      existingPref.frequency++;
      existingPref.satisfaction = completed ? 
        Math.min(1, existingPref.satisfaction + 0.1) : 
        Math.max(0, existingPref.satisfaction - 0.1);
    } else {
      this.userPreferences.push({
        styleId,
        frequency: 1,
        context: {
          imageType: imageAnalysis.subjectType,
          orientation: imageAnalysis.orientation,
          timeOfDay: new Date().getHours()
        },
        satisfaction: completed ? 0.8 : 0.3
      });
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
