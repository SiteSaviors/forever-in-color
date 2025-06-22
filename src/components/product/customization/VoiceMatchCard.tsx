
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mic } from "lucide-react";

interface VoiceMatchCardProps {
  enabled: boolean;
  livingMemoryEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const VoiceMatchCard = ({ enabled, livingMemoryEnabled, onEnabledChange }: VoiceMatchCardProps) => {
  return (
    <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
      !livingMemoryEnabled 
        ? 'opacity-50 cursor-not-allowed' 
        : enabled 
          ? 'ring-2 ring-blue-200 shadow-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-l-4 border-l-blue-400' 
          : 'shadow-lg hover:shadow-blue-100/50'
    }`}>
      <CardContent className="p-4 md:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 md:gap-4 flex-1">
            <div className={`p-2 md:p-3 rounded-xl transition-all duration-300 ${
              enabled && livingMemoryEnabled
                ? 'bg-blue-100 text-blue-600 animate-slide-in' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-400'
            }`}>
              <Mic className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <h5 className="text-lg md:text-xl font-bold text-gray-900 font-poppins tracking-tight">Custom Voice Match</h5>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-700 font-semibold px-2 md:px-3 py-1 text-xs">
                    $19.99
                  </Badge>
                  {!livingMemoryEnabled && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                      Requires Living Memory
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-2">
                Add your own voice narration to make the AR experience truly personal
              </p>
              <p className="text-sm text-blue-600 font-medium">
                🎙️ Record up to 30 seconds • Professional audio enhancement
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            disabled={!livingMemoryEnabled}
            className="data-[state=checked]:bg-blue-500 ml-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceMatchCard;
