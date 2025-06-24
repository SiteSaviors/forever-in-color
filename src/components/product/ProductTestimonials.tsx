
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Quote, Heart, Camera, Gift, Users, Clock, CheckCircle } from "lucide-react";

const ProductTestimonials = () => {
  const featuredTestimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      location: "San Francisco, CA",
      avatar: "🌸",
      rating: 5,
      date: "2 weeks ago",
      product: "Living Memory Canvas - Watercolor Dreams",
      title: "Absolutely magical experience",
      content: "I ordered this canvas of my late grandmother for Mother's Day. The Watercolor Dreams style captured her gentle spirit perfectly, and the Living Memory feature... I can't even describe the emotion when I heard her voice again. My family was in tears (happy ones!). This isn't just art - it's pure magic.",
      images: ["12x16", "Living Memory"],
      verified: true,
      helpful: 47
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      location: "Austin, TX",
      avatar: "🎨",
      rating: 5,
      date: "1 week ago",
      product: "Family Portrait - Classic Oil Painting",
      title: "Better than I ever imagined",
      content: "Ordered this as a surprise for our 10th anniversary. The Classic Oil Painting style made our family photo look like it belonged in a museum. The quality is incredible - you can see every brushstroke detail. My wife cried when she saw it. Worth every penny and more.",
      images: ["20x24", "Floating Frame"],
      verified: true,
      helpful: 32
    },
    {
      id: 3,
      name: "Jennifer Walsh",
      location: "Nashville, TN",
      avatar: "💕",
      rating: 5,
      date: "3 days ago",
      product: "Wedding Canvas - Pastel Bliss",
      title: "Our love story immortalized",
      content: "This canvas hangs above our bed and every morning we scan it to hear our wedding vows again. Three years later, it still gives us goosebumps. The Pastel Bliss style is so romantic and dreamy. The colors are vibrant and the quality is museum-grade. Highly recommend!",
      images: ["16x20", "Voice Match", "Living Memory"],
      verified: true,
      helpful: 28
    }
  ];

  const quickStats = [
    { icon: Users, label: "Happy Customers", value: "50,000+" },
    { icon: Star, label: "Average Rating", value: "4.9/5" },
    { icon: Camera, label: "Canvases Created", value: "75,000+" },
    { icon: Heart, label: "Love Stories", value: "12,500+" }
  ];

  const recentReviews = [
    {
      name: "David K.",
      rating: 5,
      text: "Fast shipping, amazing quality. The AR feature blew my mind!",
      time: "2 hours ago"
    },
    {
      name: "Maria S.",
      rating: 5,
      text: "Perfect gift for my mom's birthday. She loves it!",
      time: "5 hours ago"
    },
    {
      name: "James L.",
      rating: 5,
      text: "The Living Memory feature is incredible. Highly recommend.",
      time: "1 day ago"
    },
    {
      name: "Lisa M.",
      rating: 5,
      text: "Beautiful colors and excellent customer service.",
      time: "2 days ago"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700">
            Customer Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See Why Families Love Their Canvases
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of families who have transformed their precious memories into living art
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center bg-white/80 backdrop-blur-sm border-gray-200">
                <CardContent className="pt-6">
                  <IconComponent className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-300">
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
          ))}
        </div>

        {/* Recent Reviews Stream */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
              <Badge className="bg-green-100 text-green-700 text-xs">Live</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {recentReviews.map((review, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.name}</span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">"{review.text}"</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {review.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                View All 2,847 Reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProductTestimonials;
