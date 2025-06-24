
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { SizeOption } from "../types";
import { getCanvasPreview } from "../utils/canvasPreview";

interface SizeCardProps {
  option: SizeOption;
  orientation: string;
  isSelected: boolean;
  onClick: () => void;
  onContinue: (e: React.MouseEvent) => void;
}

const SizeCard = ({ option, orientation, isSelected, onClick, onContinue }: SizeCardProps) => {
  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
        isSelected 
          ? 'ring-2 ring-indigo-200 shadow-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-l-4 border-l-indigo-400' 
          : 'shadow-lg hover:shadow-indigo-100/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="mb-6">
          {getCanvasPreview(orientation, option.size)}
        </div>
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className={`font-bold text-xl font-poppins tracking-tight ${
              isSelected ? 'text-indigo-600' : 'text-gray-900'
            }`}>
              {option.category}
            </span>
            {option.popular && (
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 font-semibold">
                <Sparkles className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-tight">
            {option.description}
          </p>
          <div className="space-y-2">
            <div className="text-sm text-gray-500 line-through">
              ${option.originalPrice}
            </div>
            <div className="text-2xl font-bold text-gray-900 font-poppins tracking-tight">
              ${option.salePrice}
            </div>
          </div>
          
          <div className="pt-3">
            <Button 
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Continue with {option.category}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SizeCard;
