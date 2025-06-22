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
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              enabled && livingMemoryEnabled
                ? 'bg-blue-100 text-blue-600 animate-slide-in' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-400'
            }`}>
              <Mic className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h5 className="text-xl font-bold text-gray-900 font-poppins tracking-tight">Custom Voice Match</h5>
                <Badge className="bg-blue-100 text-blue-700 font-semibold px-3 py-1">
                  $19.99
                </Badge>
                {!livingMemoryEnabled && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                    Requires Living Memory
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-base leading-relaxed mb-2">
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
            className="data-[state=checked]:bg-blue-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceMatchCard;
