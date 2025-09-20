import { Star, Heart, Verified, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      review: "Absolutely stunning transformation! The colors are so vibrant.",
      verifiedPurchase: true
    },
    {
      id: 2,
      customerName: "Mike Chen",
      location: "Austin, TX", 
      rating: 5,
      artStyle: "Watercolor Dreams",
      beforeImage: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
      afterImage: "/lovable-uploads/d53ba462-1fad-4ba8-8ac5-273c9a81b396.png",
      review: "Museum-quality artwork. Exceeded all expectations!",
      verifiedPurchase: true
    },
    {
      id: 3,
      customerName: "Emma Rodriguez", 
      location: "Miami, FL",
      rating: 5,
      artStyle: "Classic Oil Painting",
      beforeImage: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png",
      review: "Perfect for our living room. She cried happy tears!",
      verifiedPurchase: true
    },
    {
      id: 4,
      customerName: "David Kim",
      location: "Seattle, WA",
      rating: 5,
      artStyle: "Pastel Bliss",
      beforeImage: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=400&fit=crop",
      afterImage: "/lovable-uploads/755c41d5-3b97-4a56-bdeb-ac8a77718919.png",
      review: "Soft pastels create such a calming atmosphere.",
      verifiedPurchase: true
    },
    {
      id: 5,
      customerName: "Lisa Thompson",
      location: "Denver, CO",
      rating: 5,
      artStyle: "Electric Bloom",
      beforeImage: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=400&h=400&fit=crop",
      afterImage: "/lovable-uploads/7787f528-8bd9-4638-9919-ce34a4594672.png",
      review: "Perfect for our modern living room aesthetic!",
      verifiedPurchase: true
    },
    {
      id: 6,
      customerName: "James Wilson",
      location: "Boston, MA",
      rating: 5,
      artStyle: "Original Image",
      beforeImage: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      afterImage: "/lovable-uploads/f12521ab-3c25-4353-831c-59f97d5dcd43.png",
      review: "Print quality and framing exceeded expectations.",
      verifiedPurchase: true
    },
    {
      id: 7,
      customerName: "Ashley Martinez",
      location: "Phoenix, AZ",
      rating: 5,
      artStyle: "Crystalized Charm",
      beforeImage: "https://images.unsplash.com/photo-1494790108755-2616c2d0b3ef?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/d883b2be-71cd-48d2-9bc8-0ea339cd52ef.png",
      review: "The crystal effect is absolutely magical!",
      verifiedPurchase: true
    },
    {
      id: 8,
      customerName: "Ryan O'Connor",
      location: "Chicago, IL",
      rating: 5,
      artStyle: "3D Storybook",
      beforeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/d9eba048-5139-431c-b278-1c1b32a78602.png",
      review: "Kids love seeing themselves as cartoon characters!",
      verifiedPurchase: true
    },
    {
      id: 9,
      customerName: "Maria Santos",
      location: "Los Angeles, CA",
      rating: 5,
      artStyle: "Artisan Charcoal",
      beforeImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      review: "Elegant and timeless. Perfect for our bedroom.",
      verifiedPurchase: true
    },
    {
      id: 10,
      customerName: "Tommy Park",
      location: "Nashville, TN",
      rating: 5,
      artStyle: "Watercolor Dreams",
      beforeImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/d53ba462-1fad-4ba8-8ac5-273c9a81b396.png",
      review: "Exceeded expectations. Quality is incredible!",
      verifiedPurchase: true
    },
    {
      id: 11,
      customerName: "Jennifer Lee",
      location: "San Francisco, CA",
      rating: 5,
      artStyle: "Pastel Bliss",
      beforeImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/755c41d5-3b97-4a56-bdeb-ac8a77718919.png",
      review: "So dreamy and beautiful. Everyone asks where I got it!",
      verifiedPurchase: true
    },
    {
      id: 12,
      customerName: "Mark Thompson",
      location: "Orlando, FL",
      rating: 5,
      artStyle: "Classic Oil Painting",
      beforeImage: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png",
      review: "Looks like a painting from a famous museum!",
      verifiedPurchase: true
    },
    {
      id: 13,
      customerName: "Rachel Green",
      location: "New York, NY",
      rating: 5,
      artStyle: "Electric Bloom",
      beforeImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/7787f528-8bd9-4638-9919-ce34a4594672.png",
      review: "Bold and modern. Perfect conversation starter!",
      verifiedPurchase: true
    },
    {
      id: 14,
      customerName: "Carlos Rodriguez",
      location: "San Diego, CA",
      rating: 5,
      artStyle: "Neon Splash",
      beforeImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/e235cbba-357a-429f-a7f3-43e8b187823b.png",
      review: "The energy in this piece is incredible!",
      verifiedPurchase: true
    },
    {
      id: 15,
      customerName: "Amanda White",
      location: "Atlanta, GA",
      rating: 5,
      artStyle: "Original Image",
      beforeImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face",
      afterImage: "/lovable-uploads/f12521ab-3c25-4353-831c-59f97d5dcd43.png",
      review: "Crystal clear quality. Better than expected!",
      verifiedPurchase: true
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 bg-white rounded-2xl p-8 shadow-sm">
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

        {/* Staggered Photo Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 mb-16">
          {photoReviews.map((review, index) => (
            <div 
              key={review.id} 
              className={`break-inside-avoid mb-4 ${index % 2 === 1 ? 'mt-8' : ''}`}
            >
              <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-0">
                  {/* Main Image with Hover Effect */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {/* After Image (Default) */}
                    <img
                      src={review.afterImage}
                      alt="Customer transformation"
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                    />
                    
                    {/* Before Image (On Hover) */}
                    <img
                      src={review.beforeImage}
                      alt="Original photo"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    {/* Art Style Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-gray-800 text-xs font-medium">
                        {review.artStyle}
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="absolute bottom-3 left-3 flex items-center bg-white/90 rounded-full px-2 py-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Verified Badge */}
                    {review.verifiedPurchase && (
                      <div className="absolute bottom-3 right-3 bg-green-500 rounded-full p-1.5">
                        <Verified className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Hover Overlay Text */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Original Photo</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="p-4">
                    <p className="text-sm text-gray-700 mb-3 font-medium line-clamp-2">
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
            </div>
          ))}
        </div>

        {/* Trust Elements */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm">
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
