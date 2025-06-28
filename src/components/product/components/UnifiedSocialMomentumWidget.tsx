import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface UnifiedSocialMomentumWidgetProps {
  currentStep: number;
  uploadedImage: string | null;
  showWidget: boolean;
}

const UnifiedSocialMomentumWidget = ({
  showWidget
}: UnifiedSocialMomentumWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data for social proof
  useEffect(() => {
    if (!showWidget) return;

    const interval = setInterval(() => {
      // Update live statistics here
    }, 5000);

    return () => clearInterval(interval);
  }, [showWidget]);

  if (!showWidget) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">Live Activity</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Real-time
            </Badge>
          </div>

          {isExpanded ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span>People creating now:</span>
                  <span className="font-semibold text-green-600">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Orders today:</span>
                  <span className="font-semibold text-blue-600">183</span>
                </div>
              </div>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Show less
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                47 people are creating their canvas right now
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                View details
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedSocialMomentumWidget;
