import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Heart } from '@/components/ui/icons';

const ARCallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-slate-900 to-black relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <Heart className="w-16 h-16 text-pink-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Ready to Bring Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Memory</span> to Life?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Don't let precious moments remain silent. Give them voice, motion, and eternal presence.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-6 text-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full">
            Start Your AR Canvas
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
          <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10 px-12 py-6 text-xl font-semibold rounded-full">
            See Real Examples
            <Play className="w-6 h-6 ml-3" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-white font-semibold mb-2">30-Day Guarantee</h3>
            <p className="text-gray-400 text-sm">Love your AR canvas or get your money back</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="text-white font-semibold mb-2">Free Shipping</h3>
            <p className="text-gray-400 text-sm">Delivered safely to your door, anywhere in the US</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-3">💖</div>
            <h3 className="text-white font-semibold mb-2">Made with Love</h3>
            <p className="text-gray-400 text-sm">Each canvas crafted to honor your most precious memories</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 italic text-lg">
            "It's not just a canvas — it's a portal to the moments that matter most."
          </p>
        </div>
      </div>
    </section>
  );
};

export default ARCallToAction;
