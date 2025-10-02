
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Heart, Star } from "@/components/ui/icons";

const NeonSplashFeatures = () => {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-gray-800 border-pink-500/20 hover:shadow-lg hover:shadow-pink-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Bold Statements</h3>
              <p className="text-gray-300">Make an unforgettable impression with electric energy</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-gray-800 border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Modern Spaces</h3>
              <p className="text-gray-300">Perfect for contemporary homes and creative environments</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-gray-800 border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Star className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Unique Gifts</h3>
              <p className="text-gray-300">Give something truly one-of-a-kind and rebellious</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NeonSplashFeatures;
