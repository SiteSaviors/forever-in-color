
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Eye, Share2, Sparkles, Play, QrCode } from "lucide-react";

const InteractiveDemo = () => {
  const [selectedFeature, setSelectedFeature] = useState("ar-view");

  const features = [
    {
      id: "ar-view",
      title: "AR View",
      description: "See your artwork in your actual space before you buy",
      icon: Eye,
      color: "from-purple-500 to-pink-500",
      video: "https://player.vimeo.com/video/1094210360?badge=0&autopause=0&autoplay=1&loop=1&player_id=0&app_id=58479&muted=1"
    },
    {
      id: "qr-magic",
      title: "QR Magic",
      description: "Scan to bring your canvas to life with video memories",
      icon: QrCode,
      color: "from-blue-500 to-purple-500"
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
              {selectedFeature === "ar-view" && (
                <div className="w-full h-full relative">
                  <iframe 
                    src={features.find(f => f.id === selectedFeature)?.video}
                    className="absolute top-0 left-0 w-full h-full rounded-3xl" 
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                    title="AR Demo Video" 
                  />
                </div>
              )}
              
              {selectedFeature === "qr-magic" && (
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30"></div>
                  <div className="text-center z-10">
                    <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <QrCode className="w-16 h-16 text-gray-800" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 max-w-xs">
                      <p className="text-gray-800 font-medium mb-2">Scan QR Code</p>
                      <p className="text-sm text-gray-600">Watch your canvas come alive with video memories</p>
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
                        <Eye className="w-8 h-8 text-pink-600" />
                      </div>
                      <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-pink-600" />
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
                        
                        {feature.id === "ar-view" && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">See artwork on your wall</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Adjust size & position</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Preview before purchase</span>
                            </div>
                          </div>
                        )}
                        
                        {feature.id === "qr-magic" && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">5-30 second video memories</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Embedded QR code</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Works with any phone</span>
                            </div>
                          </div>
                        )}
                        
                        {feature.id === "share" && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Send AR links to friends</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Perfect for gifting</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Social media ready</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
