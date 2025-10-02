
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Heart, Share2, Star, TrendingUp } from "@/components/ui/icons";
import VideoTestimonialModal from "./VideoTestimonialModal";
import LiveActivityFeed from "./LiveActivityFeed";

const SocialProofGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const testimonialVideos = [
    {
      id: 1,
      title: "Grandpa's voice lives on",
      author: "Sarah M.",
      emotion: "❤️",
      views: "2.3k",
      thumbnail: "bg-gradient-to-br from-blue-100 to-purple-100",
      duration: "2:15",
      transcript: "When I lost my grandfather last year, I thought I'd never hear his stories again. But with the Living Memory feature, I can scan his portrait and hear him telling me about his adventures in the war. It's like he's still here with us, sharing his wisdom and love. My kids now get to hear their great-grandfather's voice, and it brings our family so much comfort."
    },
    {
      id: 2,
      title: "Wedding day magic",
      author: "Mike & Lisa",
      emotion: "💕",
      views: "1.8k",
      thumbnail: "bg-gradient-to-br from-pink-100 to-rose-100",
      duration: "1:45",
      transcript: "Our wedding canvas hangs in our bedroom, and every morning we scan it to hear our vows again. Three years later, it still gives us chills. The artist perfectly captured the joy in our faces, and hearing our promises to each other never gets old. It's not just a photo — it's our love story alive on our wall."
    },
    {
      id: 3,
      title: "Baby's first laugh",
      author: "Jennifer K.",
      emotion: "😊",
      views: "3.1k",
      thumbnail: "bg-gradient-to-br from-yellow-100 to-orange-100",
      duration: "1:30",
      transcript: "I recorded my baby's first real belly laugh when she was 6 months old. Now, two years later, we can still hear that pure joy whenever we look at her canvas. The Pastel Bliss style made her look like an angel, and the Living Memory feature lets us relive that perfect moment whenever we want. It's magical!"
    },
    {
      id: 4,
      title: "Military homecoming",
      author: "The Johnson Family",
      emotion: "🇺🇸",
      views: "4.2k",
      thumbnail: "bg-gradient-to-br from-red-100 to-blue-100",
      duration: "2:45",
      transcript: "When Dad came home from deployment, we created a canvas with his voice saying 'I'm home, and I love you all.' The Classic Oil Painting style made it look so dignified and timeless. Now whenever he's away for work, the kids can scan it and hear daddy telling them he loves them. It keeps our family connected no matter the distance."
    }
  ];

  const handleVideoClick = (videoIndex: number) => {
    setSelectedVideo(videoIndex);
  };

  const selectedVideoData = selectedVideo !== null ? testimonialVideos[selectedVideo] : null;

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Header with Live Stats */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-700 animate-pulse text-xs sm:text-sm">
                Live Updates
              </Badge>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              See the Magic in Action
            </h3>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">1,247</div>
                <div className="text-xs sm:text-sm text-gray-600">Living Memories</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-pink-600">98%</div>
                <div className="text-xs sm:text-sm text-gray-600">Happy Tears</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">4.9</div>
                <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                  Reviews
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <LiveActivityFeed />

          {/* Customer Video Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 text-center">
              Real Customer Stories
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {testimonialVideos.map((video, index) => (
                <div 
                  key={video.id}
                  className="group cursor-pointer"
                  onClick={() => handleVideoClick(index)}
                >
                  <div className={`relative ${video.thumbnail} rounded-lg p-3 sm:p-4 h-24 sm:h-32 flex flex-col justify-between transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg`}>
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-3 h-3 sm:w-6 sm:h-6 text-gray-800" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="relative z-10">
                      <div className="text-sm sm:text-2xl mb-0.5 sm:mb-1">{video.emotion}</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 font-medium">
                        {video.views} views • {video.duration}
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {video.title}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 truncate">
                        {video.author}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Share Section */}
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium text-purple-800">
                  Share Your Living Memory
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-purple-600 mb-2 sm:mb-3">
                Get featured in our gallery and inspire others!
              </p>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Video Modal */}
      {selectedVideoData && (
        <VideoTestimonialModal
          isOpen={selectedVideo !== null}
          onClose={() => setSelectedVideo(null)}
          testimonial={selectedVideoData}
        />
      )}
    </Card>
  );
};

export default SocialProofGallery;
