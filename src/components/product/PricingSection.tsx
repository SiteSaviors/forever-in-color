
import { Check, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PricingSection = () => {
  const packages = [
    {
      id: 1,
      name: "Essential",
      popular: false,
      price: 89,
      originalPrice: 129,
      description: "Perfect for personal spaces and gifts",
      sizes: ["12×16", "16×20"],
      features: [
        "Premium canvas print",
        "Basic black or white frame",
        "Professional art transformation",
        "Digital preview before printing",
        "Free shipping within US",
        "30-day satisfaction guarantee"
      ],
      cta: "Choose Essential",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      name: "Premium",
      popular: true,
      price: 149,
      originalPrice: 199,
      description: "Our most popular choice for stunning results",
      sizes: ["16×20", "20×24", "24×30"],
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
      cta: "Choose Premium",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      name: "Masterpiece",
      popular: false,
      price: 249,
      originalPrice: 329,
      description: "Gallery-grade artwork for the ultimate experience",
      sizes: ["20×24", "24×30", "30×40", "Custom"],
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
      cta: "Choose Masterpiece",
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Perfect Package
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Transform your precious memories into stunning framed canvas art with our carefully crafted packages
          </p>
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Limited Time: Save up to 30% on all packages
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                pkg.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              } bg-white border-0 shadow-lg`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
                  🔥 MOST POPULAR
                </div>
              )}
              
              <CardHeader className={`text-center ${pkg.popular ? 'pt-12' : 'pt-6'} pb-4`}>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${pkg.gradient} flex items-center justify-center`}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</CardTitle>
                <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">${pkg.price}</span>
                  <div className="text-left">
                    <div className="text-gray-400 line-through text-sm">${pkg.originalPrice}</div>
                    <div className="text-green-600 text-xs font-semibold">Save ${pkg.originalPrice - pkg.price}</div>
                  </div>
                </div>
                
                <div className="text-gray-600 text-sm">
                  Sizes: {pkg.sizes.join(", ")}
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5 mr-2" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full bg-gradient-to-r ${pkg.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold`}
                >
                  {pkg.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Elements */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Free shipping on all orders</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-60 day guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Secure payment processing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
