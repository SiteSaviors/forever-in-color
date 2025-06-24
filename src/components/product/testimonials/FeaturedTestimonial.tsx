
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, Quote, CheckCircle } from "lucide-react";

interface FeaturedTestimonialProps {
  testimonial: {
    id: number;
    name: string;
    location: string;
    avatar: string;
    rating: number;
    date: string;
    product: string;
    title: string;
    content: string;
    images: string[];
    verified: boolean;
    helpful: number;
  };
}

const FeaturedTestimonial = ({ testimonial }: FeaturedTestimonialProps) => {
  return (
    <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-xl">
            {testimonial.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">{testimonial.name}</span>
              {testimonial.verified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="text-sm text-gray-600">{testimonial.location}</div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-gray-500">{testimonial.date}</span>
        </div>

        {/* Product Info */}
        <div className="mb-3">
          <div className="text-sm font-medium text-purple-600 mb-1">
            {testimonial.product}
          </div>
          <div className="flex flex-wrap gap-1">
            {testimonial.images.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Title & Content */}
        <h4 className="font-semibold text-gray-900 mb-2">{testimonial.title}</h4>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          "{testimonial.content}"
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Heart className="w-3 h-3" />
            <span>{testimonial.helpful} found helpful</span>
          </div>
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
            <Quote className="w-3 h-3 mr-1" />
            Read Full Story
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedTestimonial;
