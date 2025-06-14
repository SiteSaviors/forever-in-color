
import { Check, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const packages = [
    {
      id: 1,
      name: "Essential",
      popular: false,
      price: 89,
      originalPrice: 129,
      description: "Perfect for personal spaces and gifts",
      sizes: ["12x16", "16x20"],
      features: [
        "Premium canvas print",
        "Basic black or white frame",
        "Professional art transformation",
        "Digital preview before printing",
        "Free shipping within US",
        "30-day satisfaction guarantee"
      ],
      cta: "Get Started",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      name: "Premium",
      popular: true,
      price: 149,
      originalPrice: 199,
      description: "Our most popular choice for stunning results",
      sizes: ["16x20", "20x24", "24x30"],
      features: [
        "Museum-quality canvas",
        "Choice of 5 premium frame styles",
        "Expert art transformation + touch-ups",
        "Multiple digital previews",
        "Priority processing (3-5 days)",
        "Free shipping + rush delivery",
        "60-day satisfaction guarantee",
        "Free reprints if not satisfied"
      ],
      cta: "Most Popular",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      name: "Masterpiece",
      popular: false,
      price: 249,
      originalPrice: 329,
      description: "Gallery-grade artwork for the ultimate experience",
      sizes: ["20x24", "24x30", "30x40", "Custom sizes"],
      features: [
        "Gallery-grade archival canvas",
        "Luxury handcrafted frames (10+ styles)",
        "Master artist transformation",
        "Multiple style options & revisions",
        "White-glove delivery service",
        "Professional installation guide",
        "Lifetime satisfaction guarantee",
        "Certificate of authenticity",
        "Complimentary artwork consultation"
      ],
      cta: "Go Premium",
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  const frameStyles = [
    { name: "Classic Black", popular: true, price: "Included" },
    { name: "Elegant White", popular: true, price: "Included" },
    { name: "Natural Wood", popular: false, price: "+$25" },
    { name: "Vintage Gold", popular: false, price: "+$35" },
    { name: "Modern Silver", popular: false, price: "+$30" },
    { name: "Rustic Barnwood", popular: false, price: "+$40" }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Perfect Package
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your precious memories into stunning framed canvas art with our carefully crafted packages
          </p>
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Limited Time: Save up to 30% on all packages
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                pkg.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              } bg-white/80 backdrop-blur-sm border-0 shadow-xl`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
                  🔥 MOST POPULAR
                </div>
              )}
              
              <CardHeader className={`text-center ${pkg.popular ? 'pt-12' : 'pt-8'} pb-4`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${pkg.gradient} flex items-center justify-center`}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</CardTitle>
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
                  <div className="text-left">
                    <div className="text-gray-400 line-through text-sm">${pkg.originalPrice}</div>
                    <div className="text-green-600 text-xs font-semibold">Save ${pkg.originalPrice - pkg.price}</div>
                  </div>
                </div>
                
                <div className="text-gray-600 text-sm">
                  Size options: {pkg.sizes.join(", ")}
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 mr-3" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full bg-gradient-to-r ${pkg.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold py-3`}
                  size="lg"
                >
                  {pkg.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Frame Styles Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Frame Style
            </span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameStyles.map((frame, index) => (
              <div 
                key={index} 
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  frame.popular 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-gray-200 bg-white hover:border-purple-200'
                }`}
              >
                {frame.popular && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}
                
                <div className="h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 flex items-center justify-center">
                  <div className="w-12 h-8 bg-white rounded border-2 border-gray-400" style={{
                    borderColor: frame.name.includes('Black') ? '#000' : 
                                frame.name.includes('White') ? '#fff' :
                                frame.name.includes('Gold') ? '#ffd700' :
                                frame.name.includes('Silver') ? '#c0c0c0' :
                                frame.name.includes('Wood') ? '#8b4513' : '#654321'
                  }}></div>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2">{frame.name}</h4>
                <div className={`text-sm font-medium ${
                  frame.price === 'Included' ? 'text-green-600' : 'text-purple-600'
                }`}>
                  {frame.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Guide */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Not Sure Which Size? Here's Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Size Guide
            </span>
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-lg font-semibold text-gray-900 mb-2">12" × 16"</div>
              <div className="text-sm text-gray-600 mb-3">Perfect for desks, shelves, small wall spaces</div>
              <div className="h-16 bg-blue-100 rounded flex items-center justify-center">
                <div className="w-8 h-6 bg-blue-300 rounded"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-lg font-semibold text-gray-900 mb-2">16" × 20"</div>
              <div className="text-sm text-gray-600 mb-3">Great for bedrooms, offices, medium walls</div>
              <div className="h-16 bg-purple-100 rounded flex items-center justify-center">
                <div className="w-10 h-8 bg-purple-300 rounded"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-lg font-semibold text-gray-900 mb-2">20" × 24"</div>
              <div className="text-sm text-gray-600 mb-3">Ideal for living rooms, statement pieces</div>
              <div className="h-16 bg-pink-100 rounded flex items-center justify-center">
                <div className="w-12 h-10 bg-pink-300 rounded"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-lg font-semibold text-gray-900 mb-2">24" × 30"</div>
              <div className="text-sm text-gray-600 mb-3">Perfect for large walls, gallery displays</div>
              <div className="h-16 bg-orange-100 rounded flex items-center justify-center">
                <div className="w-14 h-12 bg-orange-300 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <p className="text-gray-700 mb-4">
              <strong>Still unsure?</strong> Our team can help you choose the perfect size based on your space and photo.
            </p>
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              Get Size Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
