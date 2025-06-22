
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

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
    onCustomizationChange({
      ...customizations,
      [key]: value
    });
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
    if (value.length <= 150) {
      setMessage(value);
      onCustomizationChange({
        ...customizations,
        customMessage: value
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">🪄 Step 4: Choose Customizations</h4>
        <p className="text-gray-600">Add optional features to make your canvas even more special</p>
      </div>

      <div className="grid gap-6">
        {/* Floating Frame */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">🖼️</span>
                <h5 className="font-semibold text-gray-900">Add Floating Frame</h5>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  ${getFramePrice()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Premium floating frame that adds depth and elegance to your canvas
              </p>
            </div>
            <Switch
              checked={customizations.floatingFrame.enabled}
              onCheckedChange={(checked) => updateFrameOption('enabled', checked)}
            />
          </div>
          
          {customizations.floatingFrame.enabled && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm font-medium mb-3 block">Choose Frame Color:</Label>
              <RadioGroup
                value={customizations.floatingFrame.color}
                onValueChange={(value) => updateFrameOption('color', value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="white" />
                  <Label htmlFor="white" className="text-sm">White</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black" id="black" />
                  <Label htmlFor="black" className="text-sm">Black</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="espresso" id="espresso" />
                  <Label htmlFor="espresso" className="text-sm">Espresso</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </Card>

        {/* Living Memory Video */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">🎞️</span>
                <h5 className="font-semibold text-gray-900">Add "Living Memory" Video to Canvas</h5>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  $59.99
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Transform your static canvas into a living memory with AR video overlay
              </p>
            </div>
            <Switch
              checked={customizations.livingMemory}
              onCheckedChange={(checked) => updateCustomization('livingMemory', checked)}
            />
          </div>
        </Card>

        {/* Custom Voice Match */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">➕</span>
                <h5 className="font-semibold text-gray-900">Add Custom Voice Match</h5>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  $19.99
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Personalize your AR experience with the subject's voice
              </p>
              <p className="text-xs text-amber-600">
                Requires minimum 10-sec recording of subject's voice via email
              </p>
            </div>
            <Switch
              checked={customizations.voiceMatch}
              onCheckedChange={(checked) => updateCustomization('voiceMatch', checked)}
            />
          </div>
        </Card>

        {/* Custom Message */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">📝</span>
                <h5 className="font-semibold text-gray-900">Add Custom Message</h5>
                <Badge className="bg-teal-100 text-teal-700">
                  Free
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Add a personal message that appears with your canvas
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 block">Your Message:</Label>
            <Textarea
              placeholder="Enter your custom message here..."
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/150 characters
            </p>
          </div>
        </Card>

        {/* AI Image Upscale */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">🔍</span>
                <h5 className="font-semibold text-gray-900">Add AI Image Upscale</h5>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  $9.99
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Enhance your image quality with AI-powered upscaling technology
              </p>
            </div>
            <Switch
              checked={customizations.aiUpscale}
              onCheckedChange={(checked) => updateCustomization('aiUpscale', checked)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomizationSelector;
