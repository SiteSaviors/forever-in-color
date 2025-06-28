
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Smartphone, ArrowRight } from 'lucide-react';

const ARHero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Watch Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Memories</span> Come Alive
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Every Forever in Color canvas includes a QR code that brings your photo to life — with motion, voice, and sound.
              </p>
              <p className="text-lg text-purple-200 italic mb-8">
                "A voice you thought you'd never hear again. The wag of a tail, the laugh of a child, the vows you whispered."
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Try It Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10 px-8 py-4 text-lg font-semibold">
                See It in Action
                <Play className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Column - Canvas Mockup */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Canvas Frame */}
              <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
                <img 
                  src="/lovable-uploads/7c213c30-aab4-4e71-a805-9cfdbec2a5dd.png"
                  alt="Canvas with AR capability"
                  className="w-full h-full object-cover"
                />
                
                {/* QR Code overlay */}
                <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg">
                  <div className="w-16 h-16 bg-black rounded grid grid-cols-8 gap-0.5 p-1">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-black'} rounded-sm`}></div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Phone scanning animation */}
              <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 animate-bounce">
                <div className="bg-slate-800 rounded-2xl p-2 shadow-xl">
                  <Smartphone className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 bg-purple-500 rounded-full p-3 shadow-lg animate-pulse">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-pink-500 rounded-full p-3 shadow-lg animate-pulse delay-500">
              <div className="w-6 h-6 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ARHero;
