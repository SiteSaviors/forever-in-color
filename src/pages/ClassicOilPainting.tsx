import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Gift, 
  Crown, 
  Upload, 
  Palette, 
  Settings, 
  Package,
  Play,
  Quote,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ClassicOilPainting = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showStickyButton, setShowStickyButton] = useState(false);

  // Handle sticky button visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const galleryImages = [
    {
      before: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=400&fit=crop&crop=face",
      after: "/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png",
      type: "Portrait"
    },
    {
      before: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop",
      after: "/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png",
      type: "Pet"
    },
    {
      before: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop&crop=face",
      after: "/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png",
      type: "Family"
    }
  ];

  const testimonials = [
    {
      name: "Mark Thompson",
      location: "Orlando, FL",
      quote: "Looks like a painting from a famous museum! The oil painting style transformed our wedding photo into a timeless heirloom.",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Sarah Chen",
      location: "Boston, MA", 
      quote: "Perfect memorial piece for my grandmother. The classic oil style captured her dignity and grace beautifully.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
  ];

  const handleStartCreating = () => {
    navigate("/product", { state: { preSelectedStyle: 2, styleName: "Classic Oil Painting" } });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">
                  Classic Art Style
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Classic Oil 
                  <span className="block bg-gradient-to-r from-amber-600 via-orange-700 to-red-800 bg-clip-text text-transparent">
                    Painting
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  "Timeless brushwork. Eternal memories."
                </p>
              </div>
              
              <Button 
                onClick={handleStartCreating}
                className="bg-gradient-to-r from-amber-600 via-orange-700 to-red-800 text-white px-12 py-6 rounded-full text-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Start Creating in This Style
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>

              {/* Pricing Badge - More subtle positioning */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
                  <DollarSign className="w-4 h-4 text-gray-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Starting at only $99.99</span>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png"
                  alt="Classic Oil Painting Style Example"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                <Palette className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Inspired by traditional oil painting, this style brings depth, texture, and warmth to your most meaningful moments—whether it's a wedding portrait, a cherished pet, or a memorial tribute. Every brushstroke tells a story of love, legacy, and lasting memories.
          </p>
        </div>
      </section>

      {/* Best For Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Memorial Art</h3>
                <p className="text-gray-600">Honor loved ones with dignified, timeless portraits</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Crown className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Grandparents & Heirlooms</h3>
                <p className="text-gray-600">Create family treasures to pass down generations</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Gift className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Wedding & Anniversary Gifts</h3>
                <p className="text-gray-600">Celebrate love with museum-quality romance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">See the Transformation</h2>
          
          <div className="relative">
            <div className="flex justify-center">
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl">
                {/* Before Image */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-gray-600">Original Photo</h3>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={galleryImages[currentImageIndex].before}
                      alt="Original photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* After Image */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-amber-700">Classic Oil Painting</h3>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={galleryImages[currentImageIndex].after}
                      alt="Classic Oil Painting style"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-amber-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Choose Style</h3>
              <p className="text-gray-600 text-sm">Select Classic Oil Painting</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Upload Photo</h3>
              <p className="text-gray-600 text-sm">Share your precious memory</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Personalize</h3>
              <p className="text-gray-600 text-sm">Choose size & add AR</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Receive Your Art</h3>
              <p className="text-gray-600 text-sm">Ready to hang & cherish</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live AR Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Bring Your Art to Life</h2>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <Play className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Add AR Magic (Optional)</h3>
            <p className="text-gray-600 mb-6">
              Include a QR code that brings your Classic Oil Painting to life with a short video when scanned with any smartphone.
            </p>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              Available with AR upgrade
            </Badge>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-0">
                  <Quote className="w-8 h-8 text-amber-600 mb-4" />
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom oil painting from photo, AI-generated canvas art, traditional portrait style, meaningful gift idea, Forever in Color Classic Oil Painting style. Transform your cherished memories into timeless museum-quality artwork with rich textures and warm tones perfect for memorial art, family heirlooms, and wedding gifts.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-amber-600 via-orange-700 to-red-800 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ClassicOilPainting;
