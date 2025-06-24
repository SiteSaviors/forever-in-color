
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Music, Clock, Waveform } from "lucide-react";

interface PremiumVideoOptionsProps {
  livingMemoryEnabled: boolean;
  options: {
    voiceMatching: boolean;
    backgroundAudio: string;
    videoLength: number;
    voiceEnhancement: boolean;
  };
  onOptionsChange: (options: any) => void;
}

const PremiumVideoOptions = ({ 
  livingMemoryEnabled, 
  options, 
  onOptionsChange 
}: PremiumVideoOptionsProps) => {
  if (!livingMemoryEnabled) return null;

  const updateOption = (key: string, value: any) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Waveform className="w-5 h-5 text-purple-600" />
          Premium Video Enhancements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Matching */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="w-5 h-5 text-blue-600" />
            <div>
              <h5 className="font-medium text-gray-900">Voice Matching</h5>
              <p className="text-sm text-gray-600">Recreate loved one's voice from audio samples</p>
              <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">+$29.99</Badge>
            </div>
          </div>
          <Switch
            checked={options.voiceMatching}
            onCheckedChange={(checked) => updateOption('voiceMatching', checked)}
          />
        </div>

        {/* Background Audio */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-green-600" />
            <div>
              <h5 className="font-medium text-gray-900">Background Audio</h5>
              <p className="text-sm text-gray-600">Add ambient sounds or music</p>
              <Badge className="bg-green-100 text-green-700 text-xs mt-1">+$9.99</Badge>
            </div>
          </div>
          <Select value={options.backgroundAudio} onValueChange={(value) => updateOption('backgroundAudio', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select background audio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No background audio</SelectItem>
              <SelectItem value="ocean">Ocean waves</SelectItem>
              <SelectItem value="forest">Forest sounds</SelectItem>
              <SelectItem value="rain">Gentle rain</SelectItem>
              <SelectItem value="piano">Soft piano</SelectItem>
              <SelectItem value="custom">Upload custom audio (+$19.99)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Video Length */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <h5 className="font-medium text-gray-900">Video Length</h5>
              <p className="text-sm text-gray-600">{options.videoLength} seconds</p>
            </div>
          </div>
          <Slider
            value={[options.videoLength]}
            onValueChange={(value) => updateOption('videoLength', value[0])}
            max={30}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5s (Free)</span>
            <span>15s (+$9.99)</span>
            <span>30s (+$19.99)</span>
          </div>
        </div>

        {/* Voice Enhancement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Waveform className="w-5 h-5 text-purple-600" />
            <div>
              <h5 className="font-medium text-gray-900">AI Voice Enhancement</h5>
              <p className="text-sm text-gray-600">Improve audio clarity and reduce noise</p>
              <Badge className="bg-purple-100 text-purple-700 text-xs mt-1">+$14.99</Badge>
            </div>
          </div>
          <Switch
            checked={options.voiceEnhancement}
            onCheckedChange={(checked) => updateOption('voiceEnhancement', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumVideoOptions;
