
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Gift, Heart } from "lucide-react";

const DecoLuxeFeatures = () => {
  return (
    <section className="py-16 bg-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-stone-800 mb-12 font-serif">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-gradient-to-b from-white to-amber-50 border-2 border-amber-200/50 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-stone-800 font-serif">Sophisticated Portraits</h3>
              <p className="text-stone-600 leading-relaxed">Transform personal photos into elegant Art Deco masterpieces with geometric beauty and metallic sophistication</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-gradient-to-b from-white to-amber-50 border-2 border-amber-200/50 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-stone-800 font-serif">Wedding & Anniversary Gifts</h3>
              <p className="text-stone-600 leading-relaxed">Celebrate love with timeless elegance that captures the glamour and romance of the Art Deco era</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-gradient-to-b from-white to-amber-50 border-2 border-amber-200/50 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-stone-800 font-serif">High-End Decor</h3>
              <p className="text-stone-600 leading-relaxed">Create stunning focal points for luxury spaces with refined artistic elegance and geometric sophistication</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeFeatures;
