
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Zap } from "lucide-react";

const GemstonePolyFeatures = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-gradient-to-br from-purple-800/40 to-blue-800/40 border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow backdrop-blur-sm">
            <CardContent className="pt-6">
              <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Stylish & Eye-Catching</h3>
              <p className="text-gray-300">Perfect for customers who want something modern and visually striking</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-gradient-to-br from-blue-800/40 to-indigo-800/40 border-purple-400/20 hover:shadow-lg hover:shadow-purple-500/20 transition-shadow backdrop-blur-sm">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Emotional Energy</h3>
              <p className="text-gray-300">Ideal for pet, portrait, or couple photos with strong emotional connection</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-gradient-to-br from-indigo-800/40 to-purple-800/40 border-pink-400/20 hover:shadow-lg hover:shadow-pink-500/20 transition-shadow backdrop-blur-sm">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Digital Art Lovers</h3>
              <p className="text-gray-300">For fans of digital art, modern decor, and unique visual storytelling</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GemstonePolyFeatures;
