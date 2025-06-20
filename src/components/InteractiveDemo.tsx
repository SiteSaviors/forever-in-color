
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Share2, QrCode, Play, Zap, Heart, Clock } from "lucide-react";

const InteractiveDemo = () => {
  const [selectedFeature, setSelectedFeature] = useState("magic-frame");

  const features = [
    {
      id: "magic-frame",
      title: "✨ Where Time Stands Still",
      description: "Your canvas holds more than art—it holds a moment frozen in time. With one simple scan, watch as memories breathe life back into your space, making every glance a reunion.",
      icon: QrCode,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "watch-alive",
      title: "📱 Love Lives in Your Pocket",
      description: "No apps, no complexity—just point your phone and watch magic unfold. Share these living memories with anyone, anywhere. Grandparents across the world can feel close again.",
      icon: Smartphone,
      color: "from-blue-500 to-purple-500"
    },
    {
      id: "moments-move",
      title: "💖 When Pictures Come Home",
      description: "Hear their voice again. See that gentle smile. Feel the warmth of their embrace. These aren't just moving pictures—they're time machines that bring your heart home.",
      icon: Play,
      color: "from-pink-500 to-purple-500"
    },
    {
      id: "share-forget",
      title: "🎁 Memories That Multiply",
      description: "Some gifts keep giving forever. Share your living memories across generations, devices, and distances. Create connections that time and space cannot break.",
      icon: Share2,
      color: "from-pink-500 to-red-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emotional Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-200/60 shadow-lg mb-6">
            <Heart className="w-5 h-5 text-purple-500 fill-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-purple-700">Technology Meets the Heart</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Experience the{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Impossible
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            What if the people you love could visit you anytime? What if precious moments could live forever? 
            This isn't just technology—it's love made visible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left side - Enhanced Artwork Showcase */}
          <div className="relative flex justify-center">
            <div className="relative max-w-lg w-full space-y-8">
              {/* Main artwork with emotional context */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                <img 
                  src="/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png" 
                  alt="A couple's wedding portrait transformed into living art" 
                  className="w-full h-auto rounded-lg" 
                />
                
                {/* Emotional AR Badge */}
                <div className="absolute top-10 right-10">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold border-0 shadow-lg text-sm px-3 py-1 animate-pulse">
                    Living Memory
                  </Badge>
                </div>

                {/* Emotional overlay on hover */}
                <div className="absolute inset-8 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center pb-4">
                  <p className="text-white text-sm text-center font-medium">
                    "Every scan brings us back to our wedding day"
                  </p>
                </div>
              </div>

              {/* Enhanced QR Demo Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-dashed border-purple-200">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Heart className="w-5 h-5 text-purple-600 fill-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Feel the Magic</h3>
                    <Heart className="w-5 h-5 text-purple-600 fill-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this code and watch love come alive before your eyes
                  </p>
                </div>
                
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img 
                      src="/lovable-uploads/a81e502f-d833-4ae5-ac1d-3f1ad04724f9.png" 
                      alt="Live Demo QR Code - Scan to experience living memories" 
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
                    📱 Open your camera and point at the code
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-600">Experience Ready</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced floating elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-60 blur-xl animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-40 blur-xl animate-pulse"></div>
            </div>
          </div>

          {/* Right side - Emotional Feature Selection */}
          <div className="space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature === feature.id;
              return (
                <Card 
                  key={feature.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                    isSelected ? 'ring-2 ring-purple-400 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50' : 'hover:shadow-lg'
                  }`} 
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${feature.color} flex-shrink-0 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Enhanced "Perfect for" section with emotional context */}
            <div className="mt-12 p-6 bg-gradient-to-r from-white/60 to-purple-50/60 backdrop-blur-sm rounded-xl border border-purple-100">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Perfect for Life's Most Precious Moments:
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Honoring loved ones who live on in our hearts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Celebrating milestones that define our story</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Keeping family close across any distance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Creating heirlooms for generations to treasure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom CTA with emotional appeal */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-white/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Make Time Stand Still?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of families who've discovered that some moments are too precious to simply remember—they deserve to live forever.
            </p>
            <button className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
              <Heart className="w-5 h-5 fill-white" />
              Preserve Your Memory
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
