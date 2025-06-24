
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
    <div className="space-y-6 md:space-y-8">
      {/* Hero Demo Section */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Left: Content */}
            <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
              <div>
                <Badge className="bg-purple-100 text-purple-700 mb-3 text-xs sm:text-sm">
                  ✨ Most Popular Feature
                </Badge>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-3 font-poppins leading-tight">
                  Bring Your Canvas to Life
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                  Watch your static photo transform into a living memory with motion, voice, and emotion. 
                  Point your phone at the QR code and experience the magic.
                </p>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 lg:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">1,247</div>
                  <div className="text-xs sm:text-sm text-gray-600">Memories Created</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 lg:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-pink-600">98%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Customer Joy</div>
                </div>
              </div>

              <Button 
                onClick={handleTryDemo}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Try Demo Experience
              </Button>
            </div>

            {/* Right: Canvas Demo */}
            <div className="relative order-1 lg:order-2">
              {/* Canvas with QR Code - Optimized for mobile */}
              <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-3 sm:p-4 lg:p-6 transform hover:rotate-0 lg:rotate-2 transition-transform duration-500 mx-auto max-w-sm lg:max-w-none">
                <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative border-2 sm:border-4 border-amber-200">
                  {/* Placeholder for actual canvas photo */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center text-gray-500 px-4">
                      <Heart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 text-pink-400" />
                      <p className="text-xs sm:text-sm">Your Canvas Photo Here</p>
                      <p className="text-xs text-gray-400">With QR Code Overlay</p>
                    </div>
                  </div>
                  
                  {/* QR Code Overlay - Responsive sizing */}
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 lg:bottom-4 lg:right-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg border">
                    <QrCode className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-black" />
                  </div>

                  {/* Play Overlay when demo is playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 sm:p-6 animate-pulse">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-purple-600" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Phone - Hidden on mobile, visible on larger screens */}
                <div className="hidden sm:block absolute -right-3 lg:-right-6 top-1/2 transform -translate-y-1/2 bg-slate-800 rounded-xl lg:rounded-2xl p-1.5 lg:p-2 shadow-xl animate-bounce">
                  <div className="w-8 h-14 sm:w-10 sm:h-16 lg:w-12 lg:h-20 bg-gradient-to-b from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>

                {/* Magic Particles - Simplified for mobile */}
                <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-ping delay-1000"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enable/Disable Toggle */}
      <Card className={`transition-all duration-500 ${
        enabled 
          ? 'ring-1 sm:ring-2 ring-purple-200 shadow-lg sm:shadow-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50' 
          : 'hover:shadow-lg'
      }`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
              <div className={`p-2 sm:p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
                enabled 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  Add Living Memory Experience
                </h4>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-0">
                  Transform your canvas into an interactive memory with QR technology
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                  <Badge className="bg-purple-100 text-purple-700 text-xs sm:text-sm">$59.99</Badge>
                  <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 text-xs sm:text-sm">
                    ❤️ Customer Favorite
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => onEnabledChange(!enabled)}
              variant={enabled ? "default" : "outline"}
              className={`w-full sm:w-auto ${enabled 
                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                : "border-purple-200 text-purple-600 hover:bg-purple-50"
              }`}
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
