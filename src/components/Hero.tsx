
import { ArrowRight, Heart, Sparkles, Camera, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
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
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Memories Preserved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Art Styles</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Showcase */}
          <div className="relative">
            {/* Three Photo Frames Container */}
            <div className="relative flex justify-center items-center">
              {/* Frame 1 - Background Left */}
              <div className="absolute -left-8 -top-4 transform rotate-12 z-10">
                <div className="bg-white rounded-2xl shadow-xl p-4 w-48 h-56">
                  <div className="aspect-square bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 rounded-xl mb-3 flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <Heart className="w-8 h-8 text-orange-500 mx-auto" />
                      <p className="text-xs text-orange-700 font-medium">Pop Art Style</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-gray-600">Vibrant Pop</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frame 2 - Background Right */}
              <div className="absolute -right-8 -top-4 transform -rotate-12 z-10">
                <div className="bg-white rounded-2xl shadow-xl p-4 w-48 h-56">
                  <div className="aspect-square bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200 rounded-xl mb-3 flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <Sparkles className="w-8 h-8 text-cyan-500 mx-auto" />
                      <p className="text-xs text-cyan-700 font-medium">Neon Synthwave</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-gray-600">Retro Neon</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frame 3 - Center Main */}
              <div className="relative z-20 transform hover:scale-105 transition-transform duration-500">
                <div className="bg-white rounded-3xl shadow-2xl p-6 w-64 h-72">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-2xl mb-4 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Camera className="w-12 h-12 text-purple-500 mx-auto" />
                      <p className="text-sm text-purple-700 font-medium">Your Photo</p>
                      <p className="text-xs text-purple-600">Watercolor Style</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700">Soft Watercolor</div>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Mockup with AR Video */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-30">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                    <div className="bg-black rounded-[2rem] w-48 h-96 relative overflow-hidden">
                      {/* Screen Content */}
                      <div className="absolute inset-2 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 rounded-[1.5rem] flex items-center justify-center">
                        {/* Video Placeholder with Play Button */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-[1.5rem]"></div>
                          <div className="relative text-center space-y-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                            <div className="text-white">
                              <p className="text-sm font-semibold">AR Experience</p>
                              <p className="text-xs opacity-75">Tap to play demo</p>
                            </div>
                            {/* AR Elements Overlay */}
                            <div className="absolute -top-4 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              LIVE AR
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Phone Details */}
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Floating AR Badge */}
                  <div className="absolute -top-6 -right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                    Live AR Demo
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 bg-white shadow-lg rounded-full p-3 z-40">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white shadow-lg rounded-full p-3 z-40">
              <Camera className="w-6 h-6 text-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
