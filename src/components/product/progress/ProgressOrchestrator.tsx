
import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProgressState {
  currentStep: number;
  currentSubStep: string;
  completedSteps: number[];
  userBehavior: {
    hesitationCount: number;
    timeOnStep: number;
    lastInteraction: number;
    hoverDuration: number;
    clickPattern: string[];
  };
  contextualHelp: {
    showTooltip: boolean;
    tooltipType: string;
    tooltipMessage: string;
    helpLevel: 'minimal' | 'moderate' | 'detailed';
  };
  socialProof: {
    recentActivity: string[];
    confidenceScore: number;
    completionRate: number;
    liveUserCount: number;
    recentCompletions: number;
  };
  personalizedMessages: string[];
  conversionElements: {
    urgencyMessage: string;
    momentumScore: number;
    personalizationLevel: 'low' | 'medium' | 'high';
    timeSpentOnPlatform: number;
  };
  aiAnalysis: {
    isAnalyzing: boolean;
    analysisStage: string;
    imageType: 'portrait' | 'landscape' | 'square' | 'unknown';
    recommendedStyles: number[];
  };
}

interface ProgressAction {
  type: 'SET_STEP' | 'SET_SUB_STEP' | 'COMPLETE_STEP' | 'SHOW_HELP' | 'HIDE_HELP' | 
        'UPDATE_BEHAVIOR' | 'UPDATE_SOCIAL_PROOF' | 'ADD_PERSONALIZED_MESSAGE' |
        'UPDATE_CONVERSION_ELEMENTS' | 'START_AI_ANALYSIS' | 'COMPLETE_AI_ANALYSIS' |
        'UPDATE_HELP_LEVEL' | 'TRACK_HOVER' | 'TRACK_CLICK';
  payload: any;
}

const initialState: ProgressState = {
  currentStep: 1,
  currentSubStep: 'upload',
  completedSteps: [],
  userBehavior: {
    hesitationCount: 0,
    timeOnStep: 0,
    lastInteraction: Date.now(),
    hoverDuration: 0,
    clickPattern: []
  },
  contextualHelp: {
    showTooltip: false,
    tooltipType: '',
    tooltipMessage: '',
    helpLevel: 'minimal'
  },
  socialProof: {
    recentActivity: [
      "Emma just created her Abstract Fusion masterpiece",
      "Marcus completed his Classic Oil portrait", 
      "Sofia selected Pop Art Burst style",
      "David ordered his 24x18 canvas"
    ],
    confidenceScore: 95,
    completionRate: 87,
    liveUserCount: 247,
    recentCompletions: 43
  },
  personalizedMessages: [],
  conversionElements: {
    urgencyMessage: "",
    momentumScore: 0,
    personalizationLevel: 'low',
    timeSpentOnPlatform: 0
  },
  aiAnalysis: {
    isAnalyzing: false,
    analysisStage: '',
    imageType: 'unknown',
    recommendedStyles: []
  }
};

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'SET_STEP':
      return { 
        ...state, 
        currentStep: action.payload,
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() },
        conversionElements: {
          ...state.conversionElements,
          momentumScore: Math.min(100, state.conversionElements.momentumScore + 15)
        }
      };
    case 'SET_SUB_STEP':
      return { 
        ...state, 
        currentSubStep: action.payload,
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() }
      };
    case 'COMPLETE_STEP':
      const newMomentumScore = Math.min(100, state.conversionElements.momentumScore + 25);
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() },
        conversionElements: {
          ...state.conversionElements,
          momentumScore: newMomentumScore,
          personalizationLevel: newMomentumScore > 50 ? 'high' : newMomentumScore > 25 ? 'medium' : 'low'
        }
      };
    case 'SHOW_HELP':
      return {
        ...state,
        contextualHelp: {
          showTooltip: true,
          tooltipType: action.payload.type,
          tooltipMessage: action.payload.message,
          helpLevel: action.payload.level || state.contextualHelp.helpLevel
        }
      };
    case 'HIDE_HELP':
      return {
        ...state,
        contextualHelp: { 
          showTooltip: false, 
          tooltipType: '', 
          tooltipMessage: '',
          helpLevel: state.contextualHelp.helpLevel
        }
      };
    case 'UPDATE_BEHAVIOR':
      return {
        ...state,
        userBehavior: { ...state.userBehavior, ...action.payload }
      };
    case 'UPDATE_SOCIAL_PROOF':
      return {
        ...state,
        socialProof: { ...state.socialProof, ...action.payload }
      };
    case 'ADD_PERSONALIZED_MESSAGE':
      return {
        ...state,
        personalizedMessages: [...state.personalizedMessages, action.payload]
      };
    case 'UPDATE_CONVERSION_ELEMENTS':
      return {
        ...state,
        conversionElements: { ...state.conversionElements, ...action.payload }
      };
    case 'START_AI_ANALYSIS':
      return {
        ...state,
        aiAnalysis: {
          ...state.aiAnalysis,
          isAnalyzing: true,
          analysisStage: action.payload.stage
        }
      };
    case 'COMPLETE_AI_ANALYSIS':
      return {
        ...state,
        aiAnalysis: {
          ...state.aiAnalysis,
          isAnalyzing: false,
          analysisStage: '',
          imageType: action.payload.imageType,
          recommendedStyles: action.payload.recommendedStyles
        }
      };
    case 'UPDATE_HELP_LEVEL':
      return {
        ...state,
        contextualHelp: {
          ...state.contextualHelp,
          helpLevel: action.payload
        }
      };
    case 'TRACK_HOVER':
      return {
        ...state,
        userBehavior: {
          ...state.userBehavior,
          hoverDuration: state.userBehavior.hoverDuration + action.payload,
          lastInteraction: Date.now()
        }
      };
    case 'TRACK_CLICK':
      return {
        ...state,
        userBehavior: {
          ...state.userBehavior,
          clickPattern: [...state.userBehavior.clickPattern, action.payload].slice(-10),
          lastInteraction: Date.now()
        }
      };
    default:
      return state;
  }
}

const ProgressContext = createContext<{
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
  triggerHaptic: () => void;
  showContextualHelp: (type: string, message: string, level?: 'minimal' | 'moderate' | 'detailed') => void;
  hideContextualHelp: () => void;
  startAIAnalysis: (stage: string) => void;
  completeAIAnalysis: (imageType: string, recommendations: number[]) => void;
  trackHover: (duration: number) => void;
  trackClick: (element: string) => void;
} | null>(null);

export const ProgressOrchestrator = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const isMobile = useIsMobile();

  // Enhanced haptic feedback for mobile
  const triggerHaptic = () => {
    if (isMobile && 'vibrate' in navigator) {
      // Different vibration patterns based on action
      const pattern = state.completedSteps.length > 0 ? [50, 30, 50] : [50];
      navigator.vibrate(pattern);
    }
  };

  // Smart contextual help with progressive disclosure
  const showContextualHelp = (type: string, message: string, level: 'minimal' | 'moderate' | 'detailed' = 'minimal') => {
    dispatch({ type: 'SHOW_HELP', payload: { type, message, level } });
  };

  const hideContextualHelp = () => {
    dispatch({ type: 'HIDE_HELP', payload: null });
  };

  // AI Analysis tracking
  const startAIAnalysis = (stage: string) => {
    dispatch({ type: 'START_AI_ANALYSIS', payload: { stage } });
  };

  const completeAIAnalysis = (imageType: string, recommendations: number[]) => {
    dispatch({ type: 'COMPLETE_AI_ANALYSIS', payload: { imageType, recommendedStyles: recommendations } });
  };

  // Behavior tracking
  const trackHover = (duration: number) => {
    dispatch({ type: 'TRACK_HOVER', payload: duration });
  };

  const trackClick = (element: string) => {
    dispatch({ type: 'TRACK_CLICK', payload: element });
  };

  // Listen for custom initial help event
  useEffect(() => {
    const handleInitialHelp = (event: CustomEvent) => {
      const { type, message } = event.detail;
      showContextualHelp(type, message);
    };

    window.addEventListener('showInitialHelp', handleInitialHelp);
    return () => window.removeEventListener('showInitialHelp', handleInitialHelp);
  }, []);

  // Advanced hesitation detection with progressive help
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastInteraction = now - state.userBehavior.lastInteraction;
      
      // Progressive help levels based on hesitation
      if (timeSinceLastInteraction > 15000 && !state.contextualHelp.showTooltip) {
        const helpLevel = timeSinceLastInteraction > 45000 ? 'detailed' : 
                         timeSinceLastInteraction > 30000 ? 'moderate' : 'minimal';
        
        const helpMessages = {
          upload: {
            minimal: "💡 Upload any photo to get started",
            moderate: "💡 Upload any photo - our AI works best with clear, well-lit images. Try portrait or landscape photos!",
            detailed: "💡 Ready to create art? Upload any photo and our AI will analyze it to recommend the perfect artistic styles. Works best with clear, well-lit photos of people, pets, or landscapes."
          },
          'style-selection': {
            minimal: "🎨 Choose your favorite style",
            moderate: "🎨 Try hovering over styles to see live previews with your photo",
            detailed: "🎨 Our AI has analyzed your photo! Hover over any style to see an instant preview. The highlighted styles work especially well with your image composition."
          }
        };
        
        const messages = helpMessages[state.currentSubStep as keyof typeof helpMessages];
        if (messages) {
          showContextualHelp('hesitation', messages[helpLevel], helpLevel);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [state.userBehavior.lastInteraction, state.contextualHelp.showTooltip, state.currentSubStep]);

  // Dynamic social proof with real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const activities = [
        "Emma just created her Abstract Fusion masterpiece",
        "Marcus completed his Classic Oil portrait", 
        "Sofia selected Pop Art Burst style",
        "David ordered his 24x18 canvas",
        "Lisa chose Neon Splash for her pet photo",
        "James upgraded to Premium Float Frame",
        "Maya selected square orientation",
        "Alex just placed his order",
        "Sarah created stunning Watercolor Dreams art",
        "Mike chose Classic Oil for his family portrait",
        "Anna selected Electric Bloom style",
        "Tom ordered his 16x20 masterpiece"
      ];
      
      // Simulate live user activity
      const shuffled = [...activities].sort(() => Math.random() - 0.5);
      const newCompletions = Math.floor(Math.random() * 5) + 40;
      const liveUsers = Math.floor(Math.random() * 50) + 200;
      
      dispatch({ 
        type: 'UPDATE_SOCIAL_PROOF', 
        payload: { 
          recentActivity: shuffled.slice(0, 4),
          recentCompletions: newCompletions,
          liveUserCount: liveUsers
        }
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Conversion momentum tracking
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({
        type: 'UPDATE_CONVERSION_ELEMENTS',
        payload: {
          timeSpentOnPlatform: state.conversionElements.timeSpentOnPlatform + 1
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.conversionElements.timeSpentOnPlatform]);

  // Urgency messaging based on user behavior
  useEffect(() => {
    const timeSpent = state.conversionElements.timeSpentOnPlatform;
    const momentum = state.conversionElements.momentumScore;
    
    let urgencyMessage = "";
    if (timeSpent > 300 && momentum < 50) { // 5 minutes, low momentum
      urgencyMessage = "🔥 Your personalized recommendations are ready!";
    } else if (momentum > 75) {
      urgencyMessage = "✨ You're almost done creating your masterpiece!";
    } else if (state.completedSteps.length > 0) {
      urgencyMessage = "🎨 Great progress! Your art is taking shape...";
    }

    if (urgencyMessage !== state.conversionElements.urgencyMessage) {
      dispatch({
        type: 'UPDATE_CONVERSION_ELEMENTS',
        payload: { urgencyMessage }
      });
    }
  }, [state.conversionElements.timeSpentOnPlatform, state.conversionElements.momentumScore, state.completedSteps.length]);

  return (
    <ProgressContext.Provider value={{ 
      state, 
      dispatch, 
      triggerHaptic, 
      showContextualHelp, 
      hideContextualHelp,
      startAIAnalysis,
      completeAIAnalysis,
      trackHover,
      trackClick
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgressOrchestrator = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressOrchestrator must be used within ProgressOrchestrator');
  }
  return context;
};
