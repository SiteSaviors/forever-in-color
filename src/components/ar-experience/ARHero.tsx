
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";

const ARHero = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 text-white">
            <div>
              <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                AR Technology + Living Memories
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Hear Their Voice
                </span>
                <br />
                <span className="text-white">Again</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Your canvas becomes a portal. Scan it with your phone and watch your loved ones come alive — speaking, laughing, sharing the moments that made them who they were.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-8 py-6 text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full"
              >
                Experience AR Magic
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-400 text-purple-300 hover:bg-purple-400/10 px-8 py-6 text-lg rounded-full"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl mb-2">🎙️</div>
                <div className="text-sm text-gray-300">Voice Recording</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm text-gray-300">AR Activation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💝</div>
                <div className="text-sm text-gray-300">Living Memory</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/20">
              <img 
                src="/lovable-uploads/d883b2be-71cd-48d2-9bc8-0ea339cd52ef.png"
                alt="AR Canvas Experience"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-purple-500 text-white font-bold px-4 py-2 rounded-lg border-2 border-purple-400 transform rotate-12">
              AR Enabled!
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-pink-500 text-white font-bold px-4 py-2 rounded-lg border-2 border-pink-400 transform -rotate-12">
              Scan to Hear
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ARHero;
