
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

const PopArtBurstARPreview = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-red-100 via-yellow-100 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-8"
            style={{ textShadow: '2px 2px 0px #fbbf24' }}>
          Bring Your Art to Life
        </h2>
        <div className="bg-white border-4 border-black rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-black">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-black mb-4 text-gray-900">Add AR Comic Effects (Optional)</h3>
          <p className="text-gray-700 mb-6 font-medium leading-relaxed">
            Include a QR code that makes your Pop Art come alive with animated comic book effects, speech bubbles, and sound effects when scanned with any smartphone.
          </p>
          <Badge className="bg-gradient-to-r from-red-500 to-blue-500 text-white border-black border-2 font-bold px-4 py-2">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstARPreview;
