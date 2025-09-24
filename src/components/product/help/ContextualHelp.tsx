import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, Heart, Sparkles, ArrowRight, Users, HelpCircle, Target } from "lucide-react";
import {
  useProgressDispatch,
  useTooltip,
  useUserBehavior,
  useAIStatus,
  useSocialProof,
  useCurrentSubStep
} from "../progress/hooks/useProgressSelectors";
const ContextualHelp = () => {
  const dispatch = useProgressDispatch();
  const contextualHelp = useTooltip();
  const userBehavior = useUserBehavior();
  const aiStatus = useAIStatus();
  const socialProof = useSocialProof();
  const currentSubStep = useCurrentSubStep();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownInitialTooltip, setHasShownInitialTooltip] = useState(false);
  const [showAdvancedHelp, setShowAdvancedHelp] = useState(false);
  useEffect(() => {
    setIsVisible(contextualHelp.showTooltip);
  }, [contextualHelp.showTooltip]);

  // Show initial tooltip once after 20 seconds if no image uploaded
  useEffect(() => {
    if (hasShownInitialTooltip) return;
    const timer = setTimeout(() => {
      // Check if user hasn't uploaded an image (still on upload sub-step)
      if (currentSubStep === 'upload' && !hasShownInitialTooltip) {
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
  }, [currentSubStep, hasShownInitialTooltip]);

  // Reset the flag if user moves past upload step
  useEffect(() => {
    if (currentSubStep !== 'upload') {
      setHasShownInitialTooltip(true); // Prevent showing again
    }
  }, [currentSubStep]);
  if (!isVisible) return null;
  const handleClose = () => {
    dispatch({ type: 'HIDE_HELP' });
    setIsVisible(false);
    setShowAdvancedHelp(false);
  };
  const handleMoreHelp = () => {
    setShowAdvancedHelp(true);
  };
  const getHelpContent = () => {
    const { helpLevel } = contextualHelp;
    switch (contextualHelp.tooltipType) {
      case 'hesitation':
        return {
          icon: Lightbulb,
          title: helpLevel === 'detailed' ? "Let's get you started!" : "Need a little guidance?",
          message: contextualHelp.tooltipMessage,
          action: helpLevel === 'detailed' ? "Show me how" : "Got it!",
          variant: "helpful" as const,
          showMoreInfo: helpLevel !== 'detailed'
        };
      case 'recommendation':
        return {
          icon: Sparkles,
          title: "AI Recommendation",
          message: contextualHelp.tooltipMessage,
          action: "Try it",
          variant: "ai" as const,
          confidence: aiStatus.imageType !== 'unknown' ? 95 : 85
        };
      case 'social':
        return {
          icon: Users,
          title: "Popular Choice",
          message: contextualHelp.tooltipMessage,
          action: "Continue",
          variant: "social" as const,
          socialProof: `${socialProof.completionRate}% user satisfaction`
        };
      default:
        return {
          icon: Heart,
          title: "Helpful Tip",
          message: contextualHelp.tooltipMessage,
          action: "Thanks!",
          variant: "general" as const
        };
    }
  };
  const content = getHelpContent();
  const Icon = content.icon;
  const getAdvancedHelp = () => {
    switch (currentSubStep) {
      case 'upload':
        return {
          tips: ["📸 Best results: Clear, well-lit photos", "👥 Great for: Portraits, pets, landscapes", "📐 Any orientation works (we'll optimize it)", "🚫 Avoid: Blurry, dark, or heavily filtered images"],
          examples: "Popular uploads: Family photos, vacation shots, pet portraits"
        };
      case 'style-selection':
        return {
          tips: ["🎨 Hover over styles for instant previews", "⭐ Highlighted styles are AI-recommended for your photo", "🔄 Try different styles - you can always change later", "💡 Portrait photos work great with Classic Oil and Pop Art"],
          examples: `Perfect for ${aiStatus.imageType} photos: Abstract Fusion, Classic Oil`
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
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-scale-in">
      <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-purple-100/60">
        <CardContent className="relative p-6 space-y-4">
          <button
            type="button"
            className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-purple-100/60 bg-white/80 text-slate-500 shadow-sm transition hover:text-slate-700"
            onClick={handleClose}
            aria-label="Close helper"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Icon className="h-5 w-5" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{content.title}</h3>
                {content.variant === 'ai' && (
                  <Badge className="flex items-center gap-1 border-purple-200 bg-purple-100 text-purple-700">
                    <Sparkles className="h-3 w-3" />
                    AI Tip
                  </Badge>
                )}
                {content.variant === 'social' && (
                  <Badge className="flex items-center gap-1 border-amber-200 bg-amber-100 text-amber-700">
                    <Users className="h-3 w-3" />
                    Popular
                  </Badge>
                )}
              </div>

              <p className="text-sm text-slate-600">{content.message}</p>

              {typeof content.confidence === 'number' && (
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Target className="h-3 w-3" />
                  {content.confidence}% match confidence
                </p>
              )}

              {content.socialProof && (
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="h-3 w-3" />
                  {content.socialProof}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button size="sm" onClick={handleClose} className="gap-1">
              {content.action}
            </Button>
            {content.showMoreInfo && (
              <Button size="sm" variant="ghost" className="gap-1" onClick={handleMoreHelp}>
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showAdvancedHelp && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                <HelpCircle className="h-4 w-4" />
                More guidance
              </div>

              <ul className="space-y-2 text-sm text-slate-600">
                {advancedHelp.tips.map(tip => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>

              {advancedHelp.examples && (
                <p className="text-xs text-slate-500">{advancedHelp.examples}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default ContextualHelp;
