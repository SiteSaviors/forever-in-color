
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Share2, QrCode, Play, Zap } from "@/components/ui/icons";

const InteractiveDemo = () => {
  const [selectedFeature, setSelectedFeature] = useState("magic-frame");

  const features = [
    {
      id: "magic-frame",
      title: "✨ Magic in Every Frame",
      description: "Your art should do more than hang on the wall. With our 'Living Memories' feature, your canvas can play back real moments you can watch, hear, and feel all over again.",
      icon: QrCode,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "watch-alive",
      title: "📱 Watch It Come Alive",
      description: "Simply scan the optional QR code with your phone to unlock your memory in motion — no apps, no downloads. Just tap and relive the magic, anytime.",
      icon: Smartphone,
      color: "from-blue-500 to-purple-500"
    },
    {
      id: "moments-move",
      title: "💖 Moments That Move You",
      description: "A child's laugh. A wagging tail. A warm smile. The little moments you cherish—brought vividly to life again.",
      icon: Play,
      color: "from-pink-500 to-purple-500"
    },
    {
      id: "share-forget",
      title: "🎁 Easy to Share, Impossible to Forget",
      description: "Anyone can scan your artwork to experience the magic — creating moments that can be shared again and again, across generations and devices.",
      icon: Share2,
      color: "from-pink-500 to-red-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Where Art Meets{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Magic
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience your memories like never before with cutting-edge AR technology. 
            See, share, and relive your most precious moments in ways you never imagined.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left side - Artwork Showcase */}
          <div className="relative flex justify-center">
            <div className="relative max-w-lg w-full space-y-8">
              {/* Main artwork image */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                <img 
                  src="/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png" 
                  alt="Watercolor Dreams - Wedding portrait artwork with AR QR code" 
                  className="w-full h-auto rounded-lg" 
                />
                
                {/* AR Badge */}
                <div className="absolute top-10 right-10">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold border-0 shadow-lg text-sm px-3 py-1">
                    AR Ready
                  </Badge>
                </div>
              </div>

              {/* QR Code Demo Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-dashed border-purple-200">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Live AR Demo</h3>
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code with your phone camera to experience the magic!
                  </p>
                </div>
                
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img 
                      src="/lovable-uploads/a81e502f-d833-4ae5-ac1d-3f1ad04724f9.png" 
                      alt="Live Demo QR Code - Scan to experience AR" 
                      className="w-32 h-32 rounded-lg shadow-md object-contain" 
                    />
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    📱 Open your camera app and point at the QR code
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-green-600">Live Demo Ready</span>
                  </div>
                </div>
              </div>
              
              {/* Floating elements for visual enhancement */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-60 blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-40 blur-xl"></div>
            </div>
          </div>

          {/* Right side - Feature Selection */}
          <div className="space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature === feature.id;
              return (
                <Card 
                  key={feature.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
                  }`} 
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${feature.color} flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Perfect for section */}
            <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Perfect for:</h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Wedding & anniversary gifts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Memorial pieces that feel truly alive</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Interactive home décor</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Sharing memories in a whole new way</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Memories?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of customers who have turned their precious photos into stunning artwork
            </p>
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Start Your Transformation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
