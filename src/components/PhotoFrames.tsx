
import { Sparkles, Camera } from "lucide-react";

const PhotoFrames = () => {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full">
      {/* Frame 1 - Left Arc Position - moved further left */}
      <div className="absolute -left-16 sm:-left-20 top-8 transform -rotate-12 z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-6 w-32 h-40 sm:w-64 sm:h-72">
          <div className="aspect-square bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 rounded-2xl mb-2 sm:mb-4 overflow-hidden">
            <img 
              src="/lovable-uploads/b95a4d7b-b543-461e-926f-14769697918a.png" 
              alt="Elderly couple art example" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm font-medium text-gray-600">Pop Art Style</div>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-orange-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-pink-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 2 - Center Top Arc Position */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 rotate-3 z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-6 w-32 h-40 sm:w-64 sm:h-72">
          <div className="aspect-square bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-2xl mb-2 sm:mb-4 overflow-hidden">
            <img 
              src="/lovable-uploads/f0fb638f-ed49-4e86-aeac-0b87e27de424.png" 
              alt="Watercolor art example" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm font-medium text-gray-700">Soft Watercolor</div>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-pink-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-purple-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 3 - Right Arc Position - moved further right */}
      <div className="absolute -right-16 sm:-right-20 top-8 transform rotate-12 z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-6 w-32 h-40 sm:w-64 sm:h-72">
          <div className="aspect-square bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200 rounded-2xl mb-2 sm:mb-4 overflow-hidden">
            <img 
              src="/lovable-uploads/a26ed917-b49a-4495-a156-102b083bafd4.png" 
              alt="Vibrant pop art style couple" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm font-medium text-gray-600">Retro Neon</div>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-cyan-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-purple-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 4 - Bottom Left Position - moved down more */}
      <div className="absolute -left-16 sm:-left-20 top-44 sm:top-72 transform -rotate-12 z-15">
        <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-6 w-32 h-40 sm:w-64 sm:h-72">
          <div className="aspect-square bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 rounded-2xl mb-2 sm:mb-4 overflow-hidden">
            <img 
              src="/lovable-uploads/55c1363e-f80a-482b-8adc-a129075dced5.png" 
              alt="Minimalist art style couple" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm font-medium text-gray-600">Minimalist</div>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-teal-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 5 - Bottom Right Position - moved down more */}
      <div className="absolute -right-16 sm:-right-20 top-44 sm:top-72 transform rotate-12 z-15">
        <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-6 w-32 h-40 sm:w-64 sm:h-72">
          <div className="aspect-square bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 rounded-2xl mb-2 sm:mb-4 overflow-hidden">
            <img 
              src="/lovable-uploads/581d73aa-03e2-4173-838a-61286c6fb31c.png" 
              alt="Vintage film art style couple" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm font-medium text-gray-600">Vintage Film</div>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-amber-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-orange-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoFrames;
