
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Heart, Share2, Star, TrendingUp } from "lucide-react";

const SocialProofGallery = () => {
  const [currentVideo, setCurrentVideo] = useState(0);

  const testimonialVideos = [
    {
      id: 1,
      title: "Grandpa's voice lives on",
      author: "Sarah M.",
      emotion: "❤️",
      views: "2.3k",
      thumbnail: "bg-gradient-to-br from-blue-100 to-purple-100"
    },
    {
      id: 2,
      title: "Wedding day magic",
      author: "Mike & Lisa",
      emotion: "💕",
      views: "1.8k",
      thumbnail: "bg-gradient-to-br from-pink-100 to-rose-100"
    },
    {
      id: 3,
      title: "Baby's first laugh",
      author: "Jennifer K.",
      emotion: "😊",
      views: "3.1k",
      thumbnail: "bg-gradient-to-br from-yellow-100 to-orange-100"
    },
    {
      id: 4,
      title: "Military homecoming",
      author: "The Johnson Family",
      emotion: "🇺🇸",
      views: "4.2k",
      thumbnail: "bg-gradient-to-br from-red-100 to-blue-100"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header with Live Stats */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-700 animate-pulse">
                Live Updates
              </Badge>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              See the Magic in Action
            </h3>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">1,247</div>
                <div className="text-sm text-gray-600">Living Memories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">98%</div>
                <div className="text-sm text-gray-600">Happy Tears</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.9</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  Reviews
                </div>
              </div>
            </div>
          </div>

          {/* Customer Video Gallery */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 text-center">
              Real Customer Stories
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {testimonialVideos.map((video, index) => (
                <div 
                  key={video.id}
                  className="group cursor-pointer"
                  onClick={() => setCurrentVideo(index)}
                >
                  <div className={`relative ${video.thumbnail} rounded-lg p-4 h-32 flex flex-col justify-between transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg`}>
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-6 h-6 text-gray-800" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="relative z-10">
                      <div className="text-2xl mb-1">{video.emotion}</div>
                      <div className="text-xs text-gray-600 font-medium">
                        {video.views} views
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {video.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {video.author}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Share Section */}
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Share2 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  Share Your Living Memory
                </span>
              </div>
              <p className="text-xs text-purple-600 mb-3">
                Get featured in our gallery and inspire others!
              </p>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                Learn More
              </Button>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Maria just created a Living Memory • 2 minutes ago</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
                <span>David shared his wedding canvas • 5 minutes ago</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
                <span>Emma ordered with voice matching • 8 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialProofGallery;
