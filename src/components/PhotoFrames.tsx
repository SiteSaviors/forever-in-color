
import { Sparkles, Camera } from "lucide-react";

const PhotoFrames = () => {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md scale-95">
      {/* Frame 1 - Left Arc Position */}
      <div className="absolute left-0 sm:-left-12 top-6 sm:top-12 transform -rotate-12 z-10">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-1.5 sm:p-4 w-20 h-28 sm:w-48 sm:h-60">
          <div className="aspect-square bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 rounded-lg sm:rounded-xl mb-1 sm:mb-2 overflow-hidden">
            <img src="/lovable-uploads/b95a4d7b-b543-461e-926f-14769697918a.png" alt="Elderly couple art example" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[7px] sm:text-xs font-medium text-gray-600">3D Storybook</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-red-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-pink-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 2 - Center Top Arc Position */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 sm:-top-2 rotate-2 z-20">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-1.5 sm:p-4 w-20 h-28 sm:w-48 sm:h-60">
          <div className="aspect-square bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-lg sm:rounded-xl mb-1 sm:mb-2 overflow-hidden">
            <img src="/lovable-uploads/f0fb638f-ed49-4e86-aeac-0b87e27de424.png" alt="Watercolor art example" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[7px] sm:text-xs font-medium text-gray-700">Watercolor Dreams</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-pink-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 3 - Right Arc Position */}
      <div className="absolute right-0 sm:-right-12 top-6 sm:top-12 transform rotate-12 z-10">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-1.5 sm:p-4 w-20 h-28 sm:w-48 sm:h-60">
          <div className="aspect-square bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200 rounded-lg sm:rounded-xl mb-1 sm:mb-2 overflow-hidden">
            <img src="/lovable-uploads/a26ed917-b49a-4495-a156-102b083bafd4.png" alt="Vibrant pop art style couple" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[7px] sm:text-xs font-medium text-gray-600">Neon Splash</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-cyan-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 4 - Bottom Left Position */}
      <div className="absolute left-2 sm:-left-12 top-28 sm:top-48 transform -rotate-12 z-15">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-1.5 sm:p-4 w-20 h-28 sm:w-48 sm:h-60">
          <div className="aspect-square bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 rounded-lg sm:rounded-xl mb-1 sm:mb-2 overflow-hidden">
            <img src="/lovable-uploads/55c1363e-f80a-482b-8adc-a129075dced5.png" alt="Minimalist art style couple" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[7px] sm:text-xs font-medium text-gray-600">Classic Oil</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-emerald-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-teal-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 5 - Bottom Right Position */}
      <div className="absolute right-2 sm:-right-12 top-28 sm:top-48 transform rotate-12 z-15">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-1.5 sm:p-4 w-20 h-28 sm:w-48 sm:h-60">
          <div className="aspect-square bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 rounded-lg sm:rounded-xl mb-1 sm:mb-2 overflow-hidden">
            <img src="/lovable-uploads/581d73aa-03e2-4173-838a-61286c6fb31c.png" alt="Vintage film art style couple" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[7px] sm:text-xs font-medium text-gray-600">Abstract Fusion</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-amber-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoFrames;
