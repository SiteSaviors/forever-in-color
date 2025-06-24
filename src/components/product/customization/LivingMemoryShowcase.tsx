
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Play, Heart, Users, Sparkles } from "lucide-react";

interface LivingMemoryShowcaseProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const LivingMemoryShowcase = ({ enabled, onEnabledChange }: LivingMemoryShowcaseProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTryDemo = () => {
    setIsPlaying(true);
    // Simulate video play
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Demo Section */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div>
                <Badge className="bg-purple-100 text-purple-700 mb-4">
                  ✨ Most Popular Feature
                </Badge>
                <h3 className="text-3xl font-bold text-gray-900 mb-3 font-poppins">
                  Bring Your Canvas to Life
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Watch your static photo transform into a living memory with motion, voice, and emotion. 
                  Point your phone at the QR code and experience the magic.
                </p>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">1,247</div>
                  <div className="text-sm text-gray-600">Memories Created</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600">98%</div>
                  <div className="text-sm text-gray-600">Customer Joy</div>
                </div>
              </div>

              <Button 
                onClick={handleTryDemo}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Try Demo Experience
              </Button>
            </div>

            {/* Right: Canvas Demo */}
            <div className="relative">
              {/* Canvas with QR Code - Space for your photo */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative border-4 border-amber-200">
                  {/* Placeholder for actual canvas photo */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Heart className="w-12 h-12 mx-auto mb-2 text-pink-400" />
                      <p className="text-sm">Your Canvas Photo Here</p>
                      <p className="text-xs">With QR Code Overlay</p>
                    </div>
                  </div>
                  
                  {/* QR Code Overlay */}
                  <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
                    <QrCode className="w-16 h-16 text-black" />
                  </div>

                  {/* Play Overlay when demo is playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 animate-pulse">
                        <Play className="w-12 h-12 text-purple-600" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Phone */}
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-slate-800 rounded-2xl p-2 shadow-xl animate-bounce">
                  <div className="w-12 h-20 bg-gradient-to-b from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Magic Particles */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-ping delay-1000"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enable/Disable Toggle */}
      <Card className={`transition-all duration-500 ${
        enabled 
          ? 'ring-2 ring-purple-200 shadow-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50' 
          : 'hover:shadow-lg'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${
                enabled 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  Add Living Memory Experience
                </h4>
                <p className="text-gray-600">
                  Transform your canvas into an interactive memory with QR technology
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-purple-100 text-purple-700">$59.99</Badge>
                  <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200">
                    ❤️ Customer Favorite
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => onEnabledChange(!enabled)}
              variant={enabled ? "default" : "outline"}
              className={enabled 
                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                : "border-purple-200 text-purple-600 hover:bg-purple-50"
              }
            >
              {enabled ? "✓ Added" : "Add Feature"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivingMemoryShowcase;
