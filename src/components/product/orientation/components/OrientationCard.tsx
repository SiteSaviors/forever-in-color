import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles } from "lucide-react";
import { OrientationOption } from "../types";
import { getOrientationIcon } from "../utils/orientationIcons";
import InteractiveCanvasPreview from "./InteractiveCanvasPreview";

interface OrientationCardProps {
  orientation: OrientationOption;
  isSelected: boolean;
  isRecommended?: boolean;
  userImageUrl?: string | null;
  onClick: () => void;
}

const OrientationCard = ({ 
  orientation, 
  isSelected, 
  isRecommended = false,
  userImageUrl = null,
  onClick 
}: OrientationCardProps) => {
  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
        isSelected 
          ? 'ring-2 ring-purple-300 shadow-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-l-4 border-l-purple-500' 
          : 'shadow-lg hover:shadow-purple-100/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-6">
        {/* Premium Badge */}
        {isRecommended && (
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Recommended
            </Badge>
          </div>
        )}

        {/* Canvas Preview - Only show when we have a user image */}
        {userImageUrl ? (
          <div className="flex justify-center">
            <div className="w-32 h-32">
              <InteractiveCanvasPreview
                orientation={orientation.id}
                userImageUrl={userImageUrl}
                isSelected={isSelected}
                isRecommended={isRecommended}
                onClick={() => {}} // Prevent nested clicks
              />
            </div>
          </div>
        ) : (
          <div className={`flex justify-center p-6 rounded-xl transition-all duration-300 relative ${
            isSelected
              ? 'bg-purple-100 text-purple-600 animate-pulse'
              : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-400'
          }`}>
            {getOrientationIcon(orientation.id)}
            {isSelected && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-purple-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Selected
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Text Content */}
        <div className="text-center space-y-3">
          <h5 className="font-bold text-xl text-gray-900 font-poppins tracking-tight">
            {orientation.name}
          </h5>
          <p className="text-gray-600 text-base leading-relaxed">
            {orientation.description}
          </p>
          {isSelected && (
            <p className="text-sm text-purple-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Perfect choice for your image
            </p>
          )}
        </div>

        {/* Premium Selection Effect */}
        {isSelected && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none"></div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrientationCard;