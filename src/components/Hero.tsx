
import { ArrowRight, Heart, Sparkles, Camera } from "lucide-react";

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

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative">
              {/* Background Card */}
              <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl shadow-xl transform rotate-1"></div>
              
              {/* Main Card */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
                {/* Placeholder for transformed photo */}
                <div className="aspect-square bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-2xl mb-6 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Heart className="w-16 h-16 text-purple-500 mx-auto" />
                    <p className="text-purple-700 font-medium">Your Photo</p>
                    <p className="text-sm text-purple-600">Transformed Into Art</p>
                  </div>
                </div>
                
                {/* Style Preview Indicators */}
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Style: Neon Synthwave</div>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                + AR Experience
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white shadow-lg rounded-full p-3">
                <Camera className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
