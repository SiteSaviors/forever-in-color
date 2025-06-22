
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Video } from "lucide-react";

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
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              enabled 
                ? 'bg-purple-100 text-purple-600 animate-glow-pulse' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-400'
            }`}>
              <Video className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h5 className="text-xl font-bold text-gray-900 font-poppins tracking-tight">"Living Memory" AR Experience</h5>
                <Badge className="bg-purple-100 text-purple-700 font-semibold px-3 py-1">
                  $59.99
                </Badge>
                <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200">
                  Customer Favorite
                </Badge>
              </div>
              <p className="text-gray-600 text-base leading-relaxed mb-2">
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
            className="data-[state=checked]:bg-purple-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LivingMemoryCard;
