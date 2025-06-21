
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

const DecoLuxeARPreview = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-stone-800 to-amber-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-amber-100 mb-8 font-serif">Bring Your Art to Life</h2>
        <div className="bg-gradient-to-br from-amber-900/30 to-stone-900/30 rounded-2xl p-8 border-2 border-amber-400/30 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-amber-200 font-serif">Add AR Magic (Optional)</h3>
          <p className="text-stone-300 mb-6 leading-relaxed max-w-2xl mx-auto">
            Include a QR code that brings your Deco Luxe artwork to life with elegant geometric animations 
            and golden particle effects when scanned with any smartphone. Watch as Art Deco patterns 
            shimmer and dance around your portrait.
          </p>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/50 px-4 py-2 text-sm font-medium">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeARPreview;
