
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

const GemstonePolyARPreview = () => {
  return (
    <section className="py-16 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">Bring Your Art to Life</h2>
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-cyan-400/20 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-6">
            <Play className="w-12 h-12 text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white">Add AR Magic (Optional)</h3>
          <p className="text-gray-300 mb-6">
            Include a QR code that brings your Gemstone Poly artwork to life with shimmering crystalline animations when scanned with any smartphone.
          </p>
          <Badge className="bg-cyan-400/20 text-cyan-400 border-cyan-400/30">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default GemstonePolyARPreview;
