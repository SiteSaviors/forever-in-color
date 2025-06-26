
import { useEffect, useRef } from 'react';
import { ProgressState, ProgressAction } from '../types';

export const useProgressEffects = (
  state: ProgressState, 
  dispatch: React.Dispatch<ProgressAction>,
  showContextualHelp: (type: string, message: string, level?: 'minimal' | 'moderate' | 'detailed') => void
) => {
  const helpShownRef = useRef<Set<string>>(new Set());
  const lastHelpDismissalRef = useRef<number>(0);

  // Listen for custom initial help event
  useEffect(() => {
    const handleInitialHelp = (event: CustomEvent) => {
      const { type, message } = event.detail;
      showContextualHelp(type, message);
    };

    window.addEventListener('showInitialHelp', handleInitialHelp);
    return () => window.removeEventListener('showInitialHelp', handleInitialHelp);
  }, [showContextualHelp]);

  // Reset help tracking when user moves to different sub-step
  useEffect(() => {
    helpShownRef.current.clear();
    lastHelpDismissalRef.current = 0;
  }, [state.currentSubStep]);

  // Track when help is dismissed to prevent immediate re-showing
  useEffect(() => {
    if (!state.contextualHelp.showTooltip && helpShownRef.current.size > 0) {
      lastHelpDismissalRef.current = Date.now();
    }
  }, [state.contextualHelp.showTooltip]);

  // Advanced hesitation detection with progressive help
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastInteraction = now - state.userBehavior.lastInteraction;
      const timeSinceLastDismissal = now - lastHelpDismissalRef.current;
      
      // Don't show help if tooltip is already visible or was recently dismissed (within 30 seconds)
      if (state.contextualHelp.showTooltip || timeSinceLastDismissal < 30000) {
        return;
      }
      
      // Create unique key for current context
      const helpKey = `${state.currentSubStep}-${Math.floor(timeSinceLastInteraction / 15000)}`;
      
      // Don't show help if already shown for this context
      if (helpShownRef.current.has(helpKey)) {
        return;
      }
      
      // Progressive help levels based on hesitation
      if (timeSinceLastInteraction > 15000) {
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
          helpShownRef.current.add(helpKey);
          showContextualHelp('hesitation', messages[helpLevel], helpLevel);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [state.userBehavior.lastInteraction, state.contextualHelp.showTooltip, state.currentSubStep, showContextualHelp]);

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
  }, [dispatch]);

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
  }, [state.conversionElements.timeSpentOnPlatform, dispatch]);

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
  }, [state.conversionElements.timeSpentOnPlatform, state.conversionElements.momentumScore, state.completedSteps.length, state.conversionElements.urgencyMessage, dispatch]);
};
