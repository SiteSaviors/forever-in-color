
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, Heart, Sparkles, ArrowRight, Users, HelpCircle, Target } from "lucide-react";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";

const ContextualHelp = () => {
  const { state, hideContextualHelp, triggerHaptic, trackClick } = useProgressOrchestrator();
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
    const { helpLevel } = state.contextualHelp;
    
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
          tips: [
            "📸 Best results: Clear, well-lit photos",
            "👥 Great for: Portraits, pets, landscapes", 
            "📐 Any orientation works (we'll optimize it)",
            "🚫 Avoid: Blurry, dark, or heavily filtered images"
          ],
          examples: "Popular uploads: Family photos, vacation shots, pet portraits"
        };
      case 'style-selection':
        return {
          tips: [
            "🎨 Hover over styles for instant previews",
            "⭐ Highlighted styles are AI-recommended for your photo",
            "🔄 Try different styles - you can always change later",
            "💡 Portrait photos work great with Classic Oil and Pop Art"
          ],
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

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`
        max-w-lg w-full p-6 shadow-2xl border-0 animate-scale-in relative overflow-hidden
        ${content.variant === 'ai' ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
          content.variant === 'social' ? 'bg-gradient-to-br from-blue-50 to-indigo-50' :
          content.variant === 'helpful' ? 'bg-gradient-to-br from-amber-50 to-orange-50' :
          'bg-gradient-to-br from-gray-50 to-white'}
      `}>
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Icon className="w-full h-full" />
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 p-0 hover:bg-white/50"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${content.variant === 'ai' ? 'bg-purple-500 text-white' :
                content.variant === 'social' ? 'bg-blue-500 text-white' :
                content.variant === 'helpful' ? 'bg-amber-500 text-white' :
                'bg-gray-500 text-white'}
            `}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{content.title}</h3>
              <div className="flex gap-2 mt-1">
                {content.variant === 'ai' && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {content.confidence}% confidence
                  </Badge>
                )}
                {content.variant === 'social' && content.socialProof && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {content.socialProof}
                  </Badge>
                )}
                {state.contextualHelp.helpLevel === 'detailed' && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    Detailed Guide
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">
            {content.message}
          </p>

          {/* Advanced Help Section */}
          {(showAdvancedHelp || state.contextualHelp.helpLevel === 'detailed') && (
            <div className="bg-white/70 rounded-lg p-4 mb-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Pro Tips
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                {advancedHelp.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
              {advancedHelp.examples && (
                <p className="text-xs text-gray-500 italic">{advancedHelp.examples}</p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              className={`
                flex-1 font-semibold transition-all duration-300 hover:scale-105
                ${content.variant === 'ai' ? 'bg-purple-600 hover:bg-purple-700' :
                  content.variant === 'social' ? 'bg-blue-600 hover:bg-blue-700' :
                  content.variant === 'helpful' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-gray-600 hover:bg-gray-700'}
              `}
            >
              {content.action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            {content.showMoreInfo && !showAdvancedHelp && state.contextualHelp.helpLevel !== 'detailed' && (
              <Button
                variant="outline"
                onClick={handleMoreHelp}
                className="px-4 hover:bg-white/50"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContextualHelp;
