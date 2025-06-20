
import { Star, Quote, Heart, Verified, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const Testimonials = () => {
  const photoReviews = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      location: "Portland, OR",
      rating: 5,
      artStyle: "Neon Splash",
      beforeImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/e235cbba-357a-429f-a7f3-43e8b187823b.png",
      customerPhoto: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop",
      review: "Absolutely stunning transformation! It brought such vibrant energy to her memory while still capturing her essence perfectly.",
      verifiedPurchase: true,
      size: "large"
    },
    {
      id: 2,
      customerName: "Mike Chen",
      location: "Austin, TX", 
      rating: 5,
      artStyle: "Watercolor Dreams",
      beforeImage: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
      afterImage: "/lovable-uploads/d53ba462-1fad-4ba8-8ac5-273c9a81b396.png",
      customerPhoto: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      review: "The watercolor style turned out better than I could have imagined. Museum-grade quality!",
      verifiedPurchase: true,
      size: "medium"
    },
    {
      id: 3,
      customerName: "Emma Rodriguez", 
      location: "Miami, FL",
      rating: 5,
      artStyle: "Classic Oil Painting",
      beforeImage: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png",
      customerPhoto: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      review: "The colors are so vibrant and the framing is exceptional. She cried happy tears when she saw it!",
      verifiedPurchase: true,
      size: "medium"
    },
    {
      id: 4,
      customerName: "David Kim",
      location: "Seattle, WA",
      rating: 5,
      artStyle: "Pastel Bliss",
      beforeImage: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=400&fit=crop",
      afterImage: "/lovable-uploads/755c41d5-3b97-4a56-bdeb-ac8a77718919.png",
      customerPhoto: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      review: "Perfect for our nursery! The soft pastels create such a calming atmosphere.",
      verifiedPurchase: true,
      size: "small"
    },
    {
      id: 5,
      customerName: "Lisa Thompson",
      location: "Denver, CO",
      rating: 5,
      artStyle: "Electric Bloom",
      beforeImage: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=400&h=400&fit=crop",
      afterImage: "/lovable-uploads/7787f528-8bd9-4638-9919-ce34a4594672.png",
      customerPhoto: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
      review: "The futuristic style was exactly what we wanted for our modern living room!",
      verifiedPurchase: true,
      size: "large"
    },
    {
      id: 6,
      customerName: "James Wilson",
      location: "Boston, MA",
      rating: 5,
      artStyle: "Original Image",
      beforeImage: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      afterImage: "/lovable-uploads/f12521ab-3c25-4353-831c-59f97d5dcd43.png",
      customerPhoto: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      review: "Sometimes the original is perfect! The print quality and framing exceeded expectations.",
      verifiedPurchase: true,
      size: "medium"
    }
  ];

  const getGridItemClass = (size: string) => {
    switch (size) {
      case 'large':
        return 'md:col-span-2 md:row-span-2';
      case 'medium':
        return 'md:col-span-1 md:row-span-2';
      default:
        return 'md:col-span-1 md:row-span-1';
    }
  };

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Real{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Transformations
            </span>{" "}
            by Real Customers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how our customers transformed their precious memories into stunning framed canvas art
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
            <div className="text-gray-600 text-sm">Average Rating</div>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">2,500+</div>
            <div className="text-gray-600 text-sm">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600 text-sm">Would Recommend</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">5K+</div>
            <div className="text-gray-600 text-sm">Artworks Created</div>
          </div>
        </div>

        {/* Photo Grid Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] gap-6 mb-16">
          {photoReviews.map((review) => (
            <HoverCard key={review.id}>
              <HoverCardTrigger asChild>
                <Card className={`group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${getGridItemClass(review.size)}`}>
                  <CardContent className="p-0 relative h-full">
                    {/* Before/After Images */}
                    <div className="relative h-2/3 overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-2">
                        <div className="relative overflow-hidden">
                          <img
                            src={review.beforeImage}
                            alt="Before transformation"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                              BEFORE
                            </Badge>
                          </div>
                        </div>
                        <div className="relative overflow-hidden">
                          <img
                            src={review.afterImage}
                            alt="After transformation"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs bg-purple-600 text-white">
                              AFTER
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Overlay Elements */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                          {review.artStyle}
                        </Badge>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                        <div className="flex items-center bg-black/70 rounded-full px-2 py-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        {review.verifiedPurchase && (
                          <div className="bg-green-500 rounded-full p-1">
                            <Verified className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-4 h-1/3 flex flex-col justify-between">
                      <p className="text-sm text-gray-700 italic line-clamp-2 mb-2">
                        "{review.review}"
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{review.customerName}</div>
                          <div className="text-gray-500 text-xs">{review.location}</div>
                        </div>
                        <Heart className="w-4 h-4 text-pink-500 fill-current" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              
              <HoverCardContent className="w-80 p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={review.beforeImage}
                      alt={review.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{review.customerName}</div>
                      <div className="text-sm text-gray-500">{review.location}</div>
                    </div>
                    {review.verifiedPurchase && (
                      <Badge variant="secondary" className="text-xs">
                        <Verified className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">Style: {review.artStyle}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700">"{review.review}"</p>
                  
                  {/* Customer's Photo */}
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2 flex items-center">
                      <Camera className="w-3 h-3 mr-1" />
                      How it looks in their home:
                    </div>
                    <img
                      src={review.customerPhoto}
                      alt="Customer's photo"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>

        {/* Trust Elements */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Join Thousands of{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Satisfied Customers
            </span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Verified className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">100% Verified Reviews</h4>
              <p className="text-gray-600 text-sm">Every review is from a real, verified customer</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real Customer Photos</h4>
              <p className="text-gray-600 text-sm">Actual photos from customers in their homes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Loved by Families</h4>
              <p className="text-gray-600 text-sm">Trusted by families across the country</p>
            </div>
          </div>

          <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Create Your Masterpiece
          </button>
          <p className="text-gray-500 text-sm mt-3">See your transformation in 24 hours</p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
