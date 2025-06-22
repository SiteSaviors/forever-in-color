
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Frame, Video, Mic, MessageSquare, Sparkles } from "lucide-react";

interface CustomizationOptions {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

interface CustomizationSelectorProps {
  selectedSize: string;
  customizations: CustomizationOptions;
  onCustomizationChange: (customizations: CustomizationOptions) => void;
}

const CustomizationSelector = ({ 
  selectedSize, 
  customizations, 
  onCustomizationChange 
}: CustomizationSelectorProps) => {
  const [message, setMessage] = useState(customizations.customMessage);

  const getFramePrice = () => {
    const largeSizes = ['48" x 32"', '60" x 40"', '32" x 48"', '40" x 60"'];
    return largeSizes.includes(selectedSize) ? 99 : 49;
  };

  const updateCustomization = (key: keyof CustomizationOptions, value: any) => {
    const newCustomizations = {
      ...customizations,
      [key]: value
    };

    // If Living Memory is being disabled, also disable dependent options
    if (key === 'livingMemory' && !value) {
      newCustomizations.voiceMatch = false;
      newCustomizations.customMessage = '';
      setMessage('');
    }

    onCustomizationChange(newCustomizations);
  };

  const updateFrameOption = (key: keyof CustomizationOptions['floatingFrame'], value: any) => {
    onCustomizationChange({
      ...customizations,
      floatingFrame: {
        ...customizations.floatingFrame,
        [key]: value
      }
    });
  };

  const handleMessageChange = (value: string) => {
    if (value.length <= 150 && customizations.livingMemory) {
      setMessage(value);
      onCustomizationChange({
        ...customizations,
        customMessage: value
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="text-center mb-8 p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-100">
        <h4 className="text-2xl font-bold text-gray-900 mb-3 font-playfair">
          ✨ Step 4: Choose Premium Customizations
        </h4>
        <p className="text-gray-600 text-lg">Transform your canvas into something truly extraordinary</p>
      </div>

      <div className="grid gap-8">
        {/* Enhanced Floating Frame Card */}
        <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
          customizations.floatingFrame.enabled 
            ? 'ring-2 ring-purple-200 shadow-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-l-4 border-l-purple-400' 
            : 'shadow-lg hover:shadow-purple-100/50'
        }`}>
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  customizations.floatingFrame.enabled 
                    ? 'bg-purple-100 text-purple-600 animate-slide-in' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-400'
                }`}>
                  <Frame className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h5 className="text-xl font-bold text-gray-900 font-playfair">Premium Floating Frame</h5>
                    <Badge className="bg-blue-100 text-blue-700 font-semibold px-3 py-1">
                      ${getFramePrice()}
                    </Badge>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                      Most Popular
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed mb-2">
                    Elevate your artwork with our signature floating frame that adds depth, elegance, and gallery-quality presentation
                  </p>
                  <p className="text-sm text-purple-600 font-medium">
                    ✨ Museum-grade materials • Ready to hang • Lifetime warranty
                  </p>
                </div>
              </div>
              <Switch
                checked={customizations.floatingFrame.enabled}
                onCheckedChange={(checked) => updateFrameOption('enabled', checked)}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
            
            {customizations.floatingFrame.enabled && (
              <div className="mt-6 pt-6 border-t border-purple-100 animate-slide-in">
                <Label className="text-base font-semibold mb-4 block font-playfair">Choose Your Frame Finish:</Label>
                <RadioGroup
                  value={customizations.floatingFrame.color}
                  onValueChange={(value) => updateFrameOption('color', value)}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'white', label: 'Pure White', desc: 'Clean & Modern' },
                    { value: 'black', label: 'Midnight Black', desc: 'Bold & Dramatic' },
                    { value: 'espresso', label: 'Rich Espresso', desc: 'Warm & Classic' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div>
                        <Label htmlFor={option.value} className="font-medium">{option.label}</Label>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Living Memory Card */}
        <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
          customizations.livingMemory 
            ? 'ring-2 ring-purple-200 shadow-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-l-4 border-l-purple-400' 
            : 'shadow-lg hover:shadow-purple-100/50'
        }`}>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  customizations.livingMemory 
                    ? 'bg-purple-100 text-purple-600 animate-glow-pulse' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-400'
                }`}>
                  <Video className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h5 className="text-xl font-bold text-gray-900 font-playfair">"Living Memory" AR Experience</h5>
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
                checked={customizations.livingMemory}
                onCheckedChange={(checked) => updateCustomization('livingMemory', checked)}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Custom Voice Match Card */}
        <Card className={`group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
          !customizations.livingMemory ? 'opacity-50 grayscale' : ''
        } ${
          customizations.voiceMatch && customizations.livingMemory
            ? 'ring-2 ring-green-200 shadow-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-l-4 border-l-green-400'
            : 'shadow-md'
        }`}>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  customizations.voiceMatch && customizations.livingMemory
                    ? 'bg-green-100 text-green-600 animate-slide-in' 
                    : !customizations.livingMemory 
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-400'
                }`}>
                  <Mic className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h5 className={`text-xl font-bold font-playfair ${
                      !customizations.livingMemory ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      Custom Voice Match
                    </h5>
                    <Badge className={`font-semibold px-3 py-1 ${
                      !customizations.livingMemory 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      $19.99
                    </Badge>
                  </div>
                  <p className={`text-base leading-relaxed mb-2 ${
                    !customizations.livingMemory ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Add the authentic voice of your loved one to create a truly personal AR experience
                  </p>
                  <p className={`text-sm font-medium ${
                    !customizations.livingMemory ? 'text-gray-400' : 'text-amber-600'
                  }`}>
                    📧 Simply email us a 10-second voice recording after purchase
                  </p>
                </div>
              </div>
              <Switch
                checked={customizations.voiceMatch}
                onCheckedChange={(checked) => updateCustomization('voiceMatch', checked)}
                disabled={!customizations.livingMemory}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Custom Message Card */}
        <Card className={`group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
          !customizations.livingMemory ? 'opacity-50 grayscale' : ''
        } ${
          customizations.customMessage && customizations.livingMemory
            ? 'ring-2 ring-teal-200 shadow-xl bg-gradient-to-r from-teal-50/50 to-cyan-50/50 border-l-4 border-l-teal-400'
            : 'shadow-md'
        }`}>
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  customizations.customMessage && customizations.livingMemory
                    ? 'bg-teal-100 text-teal-600 animate-slide-in' 
                    : !customizations.livingMemory 
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-400'
                }`}>
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h5 className={`text-xl font-bold font-playfair ${
                      !customizations.livingMemory ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      Personal Message
                    </h5>
                    <Badge className={`font-semibold px-3 py-1 ${
                      !customizations.livingMemory 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-teal-100 text-teal-700'
                    }`}>
                      Free
                    </Badge>
                  </div>
                  <p className={`text-base leading-relaxed ${
                    !customizations.livingMemory ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Add a heartfelt message that appears with your AR experience
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className={`text-base font-semibold font-playfair ${
                !customizations.livingMemory ? 'text-gray-400' : 'text-gray-900'
              }`}>
                Your Personal Message:
              </Label>
              <Textarea
                placeholder="Share what makes this memory special..."
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                className={`resize-none text-base ${
                  !customizations.livingMemory ? 'bg-gray-50' : 'focus:ring-teal-200 focus:border-teal-300'
                }`}
                rows={3}
                disabled={!customizations.livingMemory}
              />
              <div className="flex justify-between items-center">
                <p className={`text-sm ${
                  !customizations.livingMemory ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {message.length}/150 characters
                </p>
                {message.length > 140 && customizations.livingMemory && (
                  <p className="text-sm text-amber-600">Almost at the limit!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced AI Image Upscale Card */}
        <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
          customizations.aiUpscale 
            ? 'ring-2 ring-orange-200 shadow-xl bg-gradient-to-r from-orange-50/50 to-amber-50/50 border-l-4 border-l-orange-400' 
            : 'shadow-lg hover:shadow-orange-100/50'
        }`}>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  customizations.aiUpscale 
                    ? 'bg-orange-100 text-orange-600 animate-slide-in' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-400'
                }`}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h5 className="text-xl font-bold text-gray-900 font-playfair">AI Image Enhancement</h5>
                    <Badge className="bg-orange-100 text-orange-700 font-semibold px-3 py-1">
                      $9.99
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      Perfect for Phone Photos
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed mb-2">
                    Transform low-resolution photos into crisp, gallery-worthy prints with our AI upscaling technology
                  </p>
                  <p className="text-sm text-orange-600 font-medium">
                    🤖 Increases detail by up to 400% • Works on any photo quality
                  </p>
                </div>
              </div>
              <Switch
                checked={customizations.aiUpscale}
                onCheckedChange={(checked) => updateCustomization('aiUpscale', checked)}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomizationSelector;
