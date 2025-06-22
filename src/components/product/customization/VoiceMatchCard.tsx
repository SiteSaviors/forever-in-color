
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
    <Card className={`group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
      !livingMemoryEnabled ? 'opacity-50 grayscale' : ''
    } ${
      enabled && livingMemoryEnabled
        ? 'ring-2 ring-green-200 shadow-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-l-4 border-l-green-400'
        : 'shadow-md'
    }`}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              enabled && livingMemoryEnabled
                ? 'bg-green-100 text-green-600 animate-slide-in' 
                : !livingMemoryEnabled 
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-400'
            }`}>
              <Mic className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h5 className={`text-xl font-bold font-playfair ${
                  !livingMemoryEnabled ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  Custom Voice Match
                </h5>
                <Badge className={`font-semibold px-3 py-1 ${
                  !livingMemoryEnabled 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  $19.99
                </Badge>
              </div>
              <p className={`text-base leading-relaxed mb-2 ${
                !livingMemoryEnabled ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Add the authentic voice of your loved one to create a truly personal AR experience
              </p>
              <p className={`text-sm font-medium ${
                !livingMemoryEnabled ? 'text-gray-400' : 'text-amber-600'
              }`}>
                📧 Simply email us a 10-second voice recording after purchase
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            disabled={!livingMemoryEnabled}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceMatchCard;
