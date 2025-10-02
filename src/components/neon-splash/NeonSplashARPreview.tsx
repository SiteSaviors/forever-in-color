
import { Badge } from "@/components/ui/badge";
import { Play } from "@/components/ui/icons";

const NeonSplashARPreview = () => {
  return (
    <section className="py-16 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">Bring Your Art to Life</h2>
        <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-2xl p-8 border border-pink-500/20">
          <div className="flex items-center justify-center mb-6">
            <Play className="w-12 h-12 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white">Add AR Magic (Optional)</h3>
          <p className="text-gray-300 mb-6">
            Include a QR code that brings your Neon Splash artwork to life with pulsing electric animations when scanned with any smartphone.
          </p>
          <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default NeonSplashARPreview;
