
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Frame } from "lucide-react";

interface FloatingFrameCardProps {
  enabled: boolean;
  color: 'white' | 'black' | 'espresso';
  selectedSize: string;
  onEnabledChange: (enabled: boolean) => void;
  onColorChange: (color: 'white' | 'black' | 'espresso') => void;
}

const FloatingFrameCard = ({ 
  enabled, 
  color, 
  selectedSize, 
  onEnabledChange, 
  onColorChange 
}: FloatingFrameCardProps) => {
  const getFramePrice = () => {
    const largeSizes = ['48" x 32"', '60" x 40"', '32" x 48"', '40" x 60"'];
    return largeSizes.includes(selectedSize) ? 99 : 49;
  };

  return (
    <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
      enabled 
        ? 'ring-2 ring-purple-200 shadow-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-l-4 border-l-purple-400' 
        : 'shadow-lg hover:shadow-purple-100/50'
    }`}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              enabled 
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
            checked={enabled}
            onCheckedChange={onEnabledChange}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>
        
        {enabled && (
          <div className="mt-6 pt-6 border-t border-purple-100 animate-slide-in">
            <Label className="text-base font-semibold mb-4 block font-playfair">Choose Your Frame Finish:</Label>
            <RadioGroup
              value={color}
              onValueChange={onColorChange}
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
  );
};

export default FloatingFrameCard;
