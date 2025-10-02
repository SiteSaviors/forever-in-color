
import { Badge } from "@/components/ui/badge";
import { Play } from "@/components/ui/icons";

const ElectricBloomARPreview = () => {
  return (
    <section className="py-16 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">Bring Your Art to Life</h2>
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/20">
          <div className="flex items-center justify-center mb-6">
            <Play className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white">Add AR Magic (Optional)</h3>
          <p className="text-slate-300 mb-6">
            Include a QR code that brings your Electric Bloom artwork to life with pulsing electric aura animations and lightning effects when scanned with any smartphone.
          </p>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default ElectricBloomARPreview;
