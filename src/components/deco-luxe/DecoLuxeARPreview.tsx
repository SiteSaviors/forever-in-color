
import { Badge } from "@/components/ui/badge";
import { Play } from "@/components/ui/icons";

const DecoLuxeARPreview = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Bring Your Art to Life</h2>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Play className="w-12 h-12 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Add AR Magic (Optional)</h3>
          <p className="text-gray-600 mb-6">
            Include a QR code that brings your Deco Luxe artwork to life with elegant geometric animations when scanned with any smartphone.
          </p>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeARPreview;
