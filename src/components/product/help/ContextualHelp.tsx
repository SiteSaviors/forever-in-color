
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, Heart, Sparkles, ArrowRight, Users } from "lucide-react";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";

const ContextualHelp = () => {
  const { state, hideContextualHelp, triggerHaptic } = useProgressOrchestrator();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(state.contextualHelp.showTooltip);
  }, [state.contextualHelp.showTooltip]);

  if (!isVisible) return null;

  const handleClose = () => {
    triggerHaptic();
    hideContextualHelp();
  };

  const getHelpContent = () => {
    switch (state.contextualHelp.tooltipType) {
      case 'hesitation':
        return {
          icon: Lightbulb,
          title: "Need a little guidance?",
          message: state.contextualHelp.tooltipMessage,
          action: "Got it!",
          variant: "helpful" as const
        };
      case 'recommendation':
        return {
          icon: Sparkles,
          title: "AI Recommendation",
          message: state.contextualHelp.tooltipMessage,
          action: "Try it",
          variant: "ai" as const
        };
      case 'social':
        return {
          icon: Users,
          title: "Popular Choice",
          message: state.contextualHelp.tooltipMessage,
          action: "Continue",
          variant: "social" as const
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

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`
        max-w-md w-full p-6 shadow-2xl border-0 animate-scale-in relative overflow-hidden
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
              {content.variant === 'ai' && (
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              )}
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {content.message}
          </p>

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
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContextualHelp;
