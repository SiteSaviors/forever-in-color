
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Eye, Star } from "@/components/ui/icons";

const ElectricBloomFeatures = () => {
  return (
    <section className="py-16 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-slate-700 border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Futuristic Vibes</h3>
              <p className="text-slate-300">Perfect for modern spaces with cyberpunk aesthetics</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-slate-700 border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Eye className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Dramatic Impact</h3>
              <p className="text-slate-300">Create stunning focal points with electrifying presence</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-slate-700 border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Star className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Tech-Savvy Gifts</h3>
              <p className="text-slate-300">Ideal for gamers, tech enthusiasts, and future-lovers</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ElectricBloomFeatures;
