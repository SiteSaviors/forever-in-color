
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
  };
  contextualHelp: {
    showTooltip: boolean;
    tooltipType: string;
    tooltipMessage: string;
  };
  socialProof: {
    recentActivity: string[];
    confidenceScore: number;
    completionRate: number;
  };
  personalizedMessages: string[];
}

interface ProgressAction {
  type: 'SET_STEP' | 'SET_SUB_STEP' | 'COMPLETE_STEP' | 'SHOW_HELP' | 'HIDE_HELP' | 'UPDATE_BEHAVIOR' | 'UPDATE_SOCIAL_PROOF' | 'ADD_PERSONALIZED_MESSAGE';
  payload: any;
}

const initialState: ProgressState = {
  currentStep: 1,
  currentSubStep: 'upload',
  completedSteps: [],
  userBehavior: {
    hesitationCount: 0,
    timeOnStep: 0,
    lastInteraction: Date.now()
  },
  contextualHelp: {
    showTooltip: false,
    tooltipType: '',
    tooltipMessage: ''
  },
  socialProof: {
    recentActivity: [
      "Emma just created her Abstract Fusion masterpiece",
      "Marcus completed his Classic Oil portrait", 
      "Sofia selected Pop Art Burst style",
      "David ordered his 24x18 canvas"
    ],
    confidenceScore: 95,
    completionRate: 87
  },
  personalizedMessages: []
};

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'SET_STEP':
      return { 
        ...state, 
        currentStep: action.payload,
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() }
      };
    case 'SET_SUB_STEP':
      return { 
        ...state, 
        currentSubStep: action.payload,
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() }
      };
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() }
      };
    case 'SHOW_HELP':
      return {
        ...state,
        contextualHelp: {
          showTooltip: true,
          tooltipType: action.payload.type,
          tooltipMessage: action.payload.message
        }
      };
    case 'HIDE_HELP':
      return {
        ...state,
        contextualHelp: { showTooltip: false, tooltipType: '', tooltipMessage: '' }
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
    default:
      return state;
  }
}

const ProgressContext = createContext<{
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
  triggerHaptic: () => void;
  showContextualHelp: (type: string, message: string) => void;
  hideContextualHelp: () => void;
} | null>(null);

export const ProgressOrchestrator = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const isMobile = useIsMobile();

  // Haptic feedback for mobile
  const triggerHaptic = () => {
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Smart contextual help
  const showContextualHelp = (type: string, message: string) => {
    dispatch({ type: 'SHOW_HELP', payload: { type, message } });
  };

  const hideContextualHelp = () => {
    dispatch({ type: 'HIDE_HELP', payload: null });
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

  // Track user behavior for hesitation detection (excluding initial 20-second tooltip)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastInteraction = now - state.userBehavior.lastInteraction;
      
      // Only show hesitation help after 30 seconds (after initial 20-second period)
      if (timeSinceLastInteraction > 30000 && !state.contextualHelp.showTooltip) {
        const helpMessages = {
          upload: "💡 Upload any photo - our AI works best with clear, well-lit images",
          style: "🎨 Try hovering over styles to see how they transform your photo",
          orientation: "📐 Choose the format that best showcases your photo's composition",
          size: "📏 Larger sizes create more stunning wall art - most popular is 24x18\""
        };
        
        const message = helpMessages[state.currentSubStep as keyof typeof helpMessages] || "Need help? We're here to guide you!";
        showContextualHelp('hesitation', message);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [state.userBehavior.lastInteraction, state.contextualHelp.showTooltip, state.currentSubStep]);

  // Rotate social proof activity
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
        "Alex just placed his order"
      ];
      
      const shuffled = [...activities].sort(() => Math.random() - 0.5);
      dispatch({ 
        type: 'UPDATE_SOCIAL_PROOF', 
        payload: { recentActivity: shuffled.slice(0, 4) }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ProgressContext.Provider value={{ 
      state, 
      dispatch, 
      triggerHaptic, 
      showContextualHelp, 
      hideContextualHelp 
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
