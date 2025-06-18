
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Share2, QrCode, Play } from "lucide-react";

const InteractiveDemo = () => {
  const [selectedFeature, setSelectedFeature] = useState("qr-magic");

  const features = [
    {
      id: "qr-magic",
      title: "Scan to Unlock",
      description: "Each artwork includes an optional QR code that visitors can scan with their phone.",
      icon: QrCode,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "ar-experience",
      title: "AR Experience",
      description: "Watch as your artwork comes alive with animations, glowing effects, or movement.",
      icon: Smartphone,
      color: "from-blue-500 to-purple-500"
    },
    {
      id: "living-memories",
      title: "Living Memories",
      description: "A neon car revs its engine, a loved one waves hello, or a pet bounds across the screen.",
      icon: Play,
      color: "from-pink-500 to-purple-500"
    },
    {
      id: "share",
      title: "Share & Gift",
      description: "Share your AR experience with friends and family",
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

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left side - AR Preview */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl overflow-hidden relative">
              {selectedFeature === "qr-magic" && (
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-pink-200/30"></div>
                  <div className="text-center z-10">
                    <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <QrCode className="w-16 h-16 text-gray-800" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 max-w-xs">
                      <p className="text-gray-800 font-medium mb-2">Scan QR Code</p>
                      <p className="text-sm text-gray-600">Each artwork includes an optional QR code</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedFeature === "ar-experience" && (
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30"></div>
                  <div className="text-center z-10">
                    <div className="w-32 h-32 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Smartphone className="w-16 h-16 text-blue-600" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 max-w-xs">
                      <p className="text-gray-800 font-medium mb-2">AR Experience</p>
                      <p className="text-sm text-gray-600">Watch artwork come alive with effects</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedFeature === "living-memories" && (
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-purple-200/30"></div>
                  <div className="text-center z-10">
                    <div className="w-32 h-32 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Play className="w-16 h-16 text-pink-600" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 max-w-xs">
                      <p className="text-gray-800 font-medium mb-2">Living Memories</p>
                      <p className="text-sm text-gray-600">Memories that come to life</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedFeature === "share" && (
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-red-200/30"></div>
                  <div className="text-center z-10">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-pink-600" />
                      </div>
                      <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Share2 className="w-8 h-8 text-pink-600" />
                      </div>
                      <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-pink-600" />
                      </div>
                      <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Play className="w-8 h-8 text-pink-600" />
                      </div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-gray-800 font-medium">Share the Magic</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AR Badge */}
              <div className="absolute top-6 right-6">
                <Badge className="bg-white/90 text-purple-700 font-semibold border-0">
                  AR Ready
                </Badge>
              </div>
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
                  <span className="text-gray-600">Memorial pieces that feel truly alive</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Interactive gifts that wow recipients</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Conversation starters in your home</span>
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
