
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { OrientationOption } from "../types";
import { getOrientationIcon } from "../utils/orientationIcons";

interface OrientationCardProps {
  orientation: OrientationOption;
  isSelected: boolean;
  onClick: () => void;
}

const OrientationCard = ({ orientation, isSelected, onClick }: OrientationCardProps) => {
  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
        isSelected 
          ? 'ring-2 ring-teal-200 shadow-xl bg-gradient-to-r from-teal-50/50 to-cyan-50/50 border-l-4 border-l-teal-400' 
          : 'shadow-lg hover:shadow-teal-100/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-8 text-center">
        <div className={`mb-6 p-4 rounded-xl transition-all duration-300 relative ${
          isSelected
            ? 'bg-teal-100 text-teal-600 animate-slide-in'
            : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-400'
        }`}>
          {getOrientationIcon(orientation.id)}
          {isSelected && (
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-teal-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Auto-Selected
              </Badge>
            </div>
          )}
        </div>
        <h5 className="font-bold text-xl text-gray-900 mb-3 font-poppins tracking-tight">{orientation.name}</h5>
        <p className="text-gray-600 text-base leading-relaxed">{orientation.description}</p>
        {isSelected && (
          <p className="text-sm text-teal-600 mt-2 font-medium">Based on your photo crop</p>
        )}
      </CardContent>
    </Card>
  );
};

export default OrientationCard;
