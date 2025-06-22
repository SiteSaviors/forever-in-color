
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";

interface AIUpscaleCardProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const AIUpscaleCard = ({ enabled, onEnabledChange }: AIUpscaleCardProps) => {
  return (
    <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
      enabled 
        ? 'ring-2 ring-orange-200 shadow-xl bg-gradient-to-r from-orange-50/50 to-amber-50/50 border-l-4 border-l-orange-400' 
        : 'shadow-lg hover:shadow-orange-100/50'
    }`}>
      <CardContent className="p-4 md:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 md:gap-4 flex-1">
            <div className={`p-2 md:p-3 rounded-xl transition-all duration-300 ${
              enabled 
                ? 'bg-orange-100 text-orange-600 animate-slide-in' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-400'
            }`}>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <h5 className="text-lg md:text-xl font-bold text-gray-900 font-poppins tracking-tight">AI Image Enhancement</h5>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-orange-100 text-orange-700 font-semibold px-2 md:px-3 py-1 text-xs">
                    $9.99
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                    Perfect for Phone Photos
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-2">
                Transform low-resolution photos into crisp, gallery-worthy prints with our AI upscaling technology
              </p>
              <p className="text-sm text-orange-600 font-medium">
                🤖 Increases detail by up to 400% • Works on any photo quality
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            className="data-[state=checked]:bg-orange-500 ml-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AIUpscaleCard;
