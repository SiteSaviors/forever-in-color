

import { ArrowRight, Heart, Sparkles, Camera, Play } from "lucide-react";
import { Separator } from "@/components/ui/separator";
const Hero = () => {
  return <section className="relative min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-100">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your memories,{" "}
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  reimagined
                </span>{" "}
                in art
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Transform your most precious photos into stunning, modern artwork. From beloved pets to lost loved ones, 
                we create personalized pieces that preserve what matters most.
              </p>
            </div>

            {/* Key Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-gray-700 font-medium">6 unique artistic styles to choose from</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Camera className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Optional AR experience brings your art to life</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Perfect for gifting or keeping forever</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                <span>Start Creating</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-all duration-300">
                View Art Styles
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between max-w-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Memories Preserved</div>
                </div>
                <Separator orientation="vertical" className="h-12 bg-gray-300" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
                <Separator orientation="vertical" className="h-12 bg-gray-300" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Art Styles</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Showcase */}
          <div className="relative h-[600px] lg:h-[700px]">
            {/* Rainbow Photo Frames Container - positioned higher */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full">
              {/* Frame 1 - Left Arc Position - moved further left */}
              <div className="absolute -left-8 sm:-left-12 top-8 transform -rotate-12 z-10">
                <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 w-48 h-56 sm:w-64 sm:h-72">
                  <div className="aspect-square bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 rounded-2xl mb-4 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-orange-500 mx-auto" />
                      <p className="text-xs sm:text-sm text-orange-700 font-medium">Pop Art Style</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-600">Oil Painting</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frame 2 - Center Top Arc Position */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 rotate-3 z-20">
                <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 w-48 h-56 sm:w-64 sm:h-72">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-2xl mb-4 overflow-hidden">
                    <img 
                      src="/lovable-uploads/f0fb638f-ed49-4e86-aeac-0b87e27de424.png" 
                      alt="Watercolor art example" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">Soft Watercolor</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frame 3 - Right Arc Position - moved further right */}
              <div className="absolute -right-8 sm:-right-12 top-8 transform rotate-12 z-10">
                <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 w-48 h-56 sm:w-64 sm:h-72">
                  <div className="aspect-square bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200 rounded-2xl mb-4 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-500 mx-auto" />
                      <p className="text-xs sm:text-sm text-cyan-700 font-medium">Classic Oil Painting
                    </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-600">Retro Neon</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-cyan-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Larger Phone Mockup with AR Video - positioned lower */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-30">
              <div className="relative">
                {/* Phone Frame - Larger */}
                <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-black rounded-[2.5rem] w-56 h-[450px] sm:w-64 sm:h-[520px] relative overflow-hidden">
                    {/* Screen Content */}
                    <div className="absolute inset-3 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 rounded-[2rem] flex items-center justify-center">
                      {/* Video Placeholder with Play Button */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-[2rem]"></div>
                        <div className="relative text-center space-y-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto">
                            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
                          </div>
                          <div className="text-white">
                            <p className="text-sm sm:text-base font-semibold">AR Experience</p>
                            <p className="text-xs sm:text-sm opacity-75">Tap to play demo</p>
                          </div>
                          {/* AR Elements Overlay */}
                          <div className="absolute -top-6 -right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                            LIVE AR
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Phone Details */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 h-1.5 bg-gray-600 rounded-full"></div>
                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 w-32 sm:w-40 h-1.5 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
                
                {/* Floating AR Badge */}
                <div className="absolute -top-6 sm:-top-8 -right-4 sm:-right-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-semibold shadow-lg animate-pulse">
                  Live AR Demo
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 bg-white shadow-lg rounded-full p-3 z-40">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-full p-3 z-40">
              <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;

