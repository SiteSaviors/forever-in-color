import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, Heart, Sparkles, ArrowRight, Users, HelpCircle, Target } from "lucide-react";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";
const ContextualHelp = () => {
  const {
    state,
    hideContextualHelp,
    triggerHaptic,
    trackClick
  } = useProgressOrchestrator();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownInitialTooltip, setHasShownInitialTooltip] = useState(false);
  const [pageLoadTime] = useState(Date.now());
  const [showAdvancedHelp, setShowAdvancedHelp] = useState(false);
  useEffect(() => {
    setIsVisible(state.contextualHelp.showTooltip);
  }, [state.contextualHelp.showTooltip]);

  // Show initial tooltip once after 20 seconds if no image uploaded
  useEffect(() => {
    if (hasShownInitialTooltip) return;
    const timer = setTimeout(() => {
      // Check if user hasn't uploaded an image (still on upload sub-step)
      if (state.currentSubStep === 'upload' && !hasShownInitialTooltip) {
        setHasShownInitialTooltip(true);
        // This will trigger the contextual help through the existing system
        const helpEvent = new CustomEvent('showInitialHelp', {
          detail: {
            type: 'hesitation',
            message: "💡 Upload any photo - our AI works best with clear, well-lit images"
          }
        });
        window.dispatchEvent(helpEvent);
      }
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, [state.currentSubStep, hasShownInitialTooltip]);

  // Reset the flag if user moves past upload step
  useEffect(() => {
    if (state.currentSubStep !== 'upload') {
      setHasShownInitialTooltip(true); // Prevent showing again
    }
  }, [state.currentSubStep]);
  if (!isVisible) return null;
  const handleClose = () => {
    triggerHaptic();
    trackClick('help-close');
    hideContextualHelp();
  };
  const handleMoreHelp = () => {
    setShowAdvancedHelp(true);
    trackClick('help-more-info');
  };
  const getHelpContent = () => {
    const {
      helpLevel
    } = state.contextualHelp;
    switch (state.contextualHelp.tooltipType) {
      case 'hesitation':
        return {
          icon: Lightbulb,
          title: helpLevel === 'detailed' ? "Let's get you started!" : "Need a little guidance?",
          message: state.contextualHelp.tooltipMessage,
          action: helpLevel === 'detailed' ? "Show me how" : "Got it!",
          variant: "helpful" as const,
          showMoreInfo: helpLevel !== 'detailed'
        };
      case 'recommendation':
        return {
          icon: Sparkles,
          title: "AI Recommendation",
          message: state.contextualHelp.tooltipMessage,
          action: "Try it",
          variant: "ai" as const,
          confidence: state.aiAnalysis.imageType !== 'unknown' ? 95 : 85
        };
      case 'social':
        return {
          icon: Users,
          title: "Popular Choice",
          message: state.contextualHelp.tooltipMessage,
          action: "Continue",
          variant: "social" as const,
          socialProof: `${state.socialProof.completionRate}% user satisfaction`
        };
      default:
        return {
          icon: Heart,
          title: "Helpful Tip",
          message: state.contextualHelp.tooltipMessage,
          action: "Thanks!",
          variant: "general" as const
        };
    }
  };
  const content = getHelpContent();
  const Icon = content.icon;
  const getAdvancedHelp = () => {
    switch (state.currentSubStep) {
      case 'upload':
        return {
          tips: ["📸 Best results: Clear, well-lit photos", "👥 Great for: Portraits, pets, landscapes", "📐 Any orientation works (we'll optimize it)", "🚫 Avoid: Blurry, dark, or heavily filtered images"],
          examples: "Popular uploads: Family photos, vacation shots, pet portraits"
        };
      case 'style-selection':
        return {
          tips: ["🎨 Hover over styles for instant previews", "⭐ Highlighted styles are AI-recommended for your photo", "🔄 Try different styles - you can always change later", "💡 Portrait photos work great with Classic Oil and Pop Art"],
          examples: `Perfect for ${state.aiAnalysis.imageType} photos: Abstract Fusion, Classic Oil`
        };
      default:
        return {
          tips: ["💫 You're doing great! Keep going to complete your masterpiece."],
          examples: ""
        };
    }
  };
  const advancedHelp = getAdvancedHelp();
  return;
};
export default ContextualHelp;