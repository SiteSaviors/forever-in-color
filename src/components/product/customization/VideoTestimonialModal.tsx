
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Heart, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VideoTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: {
    id: number;
    title: string;
    author: string;
    emotion: string;
    views: string;
    thumbnail: string;
    duration: string;
    transcript: string;
  };
}

const VideoTestimonialModal = ({ isOpen, onClose, testimonial }: VideoTestimonialModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [liked, setLiked] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Simulate video progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{testimonial.emotion}</span>
            {testimonial.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Video Player Mockup */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <div className={`absolute inset-0 ${testimonial.thumbnail} flex items-center justify-center`}>
              <div className="text-center text-white">
                <div className="text-6xl mb-4">{testimonial.emotion}</div>
                <div className="text-xl font-semibold mb-2">{testimonial.title}</div>
                <div className="text-sm opacity-75">by {testimonial.author}</div>
              </div>
              
              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handlePlayPause}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
              </div>
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-3 text-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-100"
                    style={{ width: `${currentTime}%` }}
                  />
                </div>
                
                <span className="text-sm">{formatTime(Math.floor(currentTime / 100 * 120))}/{testimonial.duration}</span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Video Info */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold">{testimonial.author}</div>
              <div className="text-sm text-gray-600">{testimonial.views} views</div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={liked ? "bg-pink-50 border-pink-200 text-pink-600" : ""}
              >
                <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
                {liked ? "Loved" : "Love"}
              </Button>
              
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
          
          {/* Transcript */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Transcript</h4>
            <p className="text-sm text-gray-700 italic">"{testimonial.transcript}"</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoTestimonialModal;
