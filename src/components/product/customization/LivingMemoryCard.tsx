
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Video } from "@/components/ui/icons";

interface LivingMemoryCardProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const LivingMemoryCard = ({ enabled, onEnabledChange }: LivingMemoryCardProps) => {
  return (
    <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
      enabled 
        ? 'ring-2 ring-purple-200 shadow-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-l-4 border-l-purple-400' 
        : 'shadow-lg hover:shadow-purple-100/50'
    }`}>
      <CardContent className="p-4 md:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 md:gap-4 flex-1">
            <div className={`p-2 md:p-3 rounded-xl transition-all duration-300 ${
              enabled 
                ? 'bg-purple-100 text-purple-600 animate-glow-pulse' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-400'
            }`}>
              <Video className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <h5 className="text-lg md:text-xl font-bold text-gray-900 font-poppins tracking-tight">"Living Memory" AR Experience</h5>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-100 text-purple-700 font-semibold px-2 md:px-3 py-1 text-xs">
                    $59.99
                  </Badge>
                  <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 text-xs">
                    Customer Favorite
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-2">
                Transform your static canvas into a magical living memory with cutting-edge AR technology
              </p>
              <p className="text-sm text-purple-600 font-medium">
                🎥 Point your phone at the canvas and watch memories come alive
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            className="data-[state=checked]:bg-purple-500 ml-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LivingMemoryCard;
