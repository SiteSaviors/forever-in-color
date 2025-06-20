
import { Sparkles, Camera } from "lucide-react";
const PhotoFrames = () => {
  return <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm sm:max-w-none">
      {/* Frame 1 - Left Arc Position */}
      <div className="absolute left-2 sm:-left-20 top-4 sm:top-8 transform -rotate-12 z-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-4 lg:p-5 w-24 h-32 sm:w-64 sm:h-72 lg:w-52 lg:h-60">
          <div className="aspect-square bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 rounded-xl sm:rounded-2xl mb-1 sm:mb-4 lg:mb-3 overflow-hidden">
            <img src="/lovable-uploads/b95a4d7b-b543-461e-926f-14769697918a.png" alt="Elderly couple art example" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[8px] sm:text-sm lg:text-xs font-medium text-gray-600">3D Storybook</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-orange-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-red-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-pink-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 2 - Center Top Arc Position */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -top-6 sm:-top-4 rotate-3 z-20">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-4 lg:p-5 w-24 h-32 sm:w-64 sm:h-72 lg:w-52 lg:h-60">
          <div className="aspect-square bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-xl sm:rounded-2xl mb-1 sm:mb-4 lg:mb-3 overflow-hidden">
            <img src="/lovable-uploads/f0fb638f-ed49-4e86-aeac-0b87e27de424.png" alt="Watercolor art example" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[8px] sm:text-sm lg:text-xs font-medium text-gray-700">Watercolor Dreams

          </div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-pink-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-purple-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 3 - Right Arc Position */}
      <div className="absolute right-2 sm:-right-20 top-4 sm:top-8 transform rotate-12 z-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-4 lg:p-5 w-24 h-32 sm:w-64 sm:h-72 lg:w-52 lg:h-60">
          <div className="aspect-square bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200 rounded-xl sm:rounded-2xl mb-1 sm:mb-4 lg:mb-3 overflow-hidden">
            <img src="/lovable-uploads/a26ed917-b49a-4495-a156-102b083bafd4.png" alt="Vibrant pop art style couple" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[8px] sm:text-sm lg:text-xs font-medium text-gray-600">        Neon Splash</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-cyan-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-blue-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-purple-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 4 - Bottom Left Position */}
      <div className="absolute left-4 sm:-left-20 top-40 sm:top-72 lg:top-56 transform -rotate-12 z-15">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-4 lg:p-5 w-24 h-32 sm:w-64 sm:h-72 lg:w-52 lg:h-60">
          <div className="aspect-square bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 rounded-xl sm:rounded-2xl mb-1 sm:mb-4 lg:mb-3 overflow-hidden">
            <img src="/lovable-uploads/55c1363e-f80a-482b-8adc-a129075dced5.png" alt="Minimalist art style couple" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[8px] sm:text-sm lg:text-xs font-medium text-gray-600">1000 Photo Mosiac</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-green-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-emerald-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-teal-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 5 - Bottom Right Position */}
      <div className="absolute right-4 sm:-right-20 top-40 sm:top-72 lg:top-56 transform rotate-12 z-15">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-4 lg:p-5 w-24 h-32 sm:w-64 sm:h-72 lg:w-52 lg:h-60">
          <div className="aspect-square bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 rounded-xl sm:rounded-2xl mb-1 sm:mb-4 lg:mb-3 overflow-hidden">
            <img src="/lovable-uploads/581d73aa-03e2-4173-838a-61286c6fb31c.png" alt="Vintage film art style couple" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[8px] sm:text-sm lg:text-xs font-medium text-gray-600">Vintage Film</div>
            <div className="flex space-x-0.5 sm:space-x-1">
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-amber-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-orange-400 rounded-full"></div>
              <div className="w-1 h-1 sm:w-3 sm:h-3 lg:w-2 lg:h-2 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PhotoFrames;
