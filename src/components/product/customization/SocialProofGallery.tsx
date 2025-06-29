
import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    image: "/placeholder-customer-1.jpg",
    artwork: "/placeholder-artwork-1.jpg",
    rating: 5,
    text: "The floating frame made my family portrait look absolutely stunning!"
  },
  {
    id: 2,
    name: "David Chen",
    image: "/placeholder-customer-2.jpg", 
    artwork: "/placeholder-artwork-2.jpg",
    rating: 5,
    text: "Premium quality and fast delivery. Highly recommend!"
  }
];

const SocialProofGallery = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <Badge className="bg-purple-100 text-purple-800">
            Customer Gallery
          </Badge>
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-500 text-xs">Artwork</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 text-yellow-400 fill-current" 
                  />
                ))}
              </div>
              <p className="text-sm italic text-gray-600">"{current.text}"</p>
              <p className="text-sm font-medium text-gray-800">- {current.name}</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevTestimonial}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={nextTestimonial}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SocialProofGallery.displayName = 'SocialProofGallery';

export default SocialProofGallery;
