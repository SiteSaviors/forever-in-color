
import { Truck, Shield, Award, Clock, CheckCircle, Star } from "lucide-react";

const TrustElements = () => {
  const trustItems = [
    {
      icon: Shield,
      title: "30-Day Guarantee",
      subtitle: "Risk-free promise",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      subtitle: "Worldwide delivery",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: Award,
      title: "Museum Quality",
      subtitle: "Premium materials",
      gradient: "from-purple-400 to-violet-500"
    },
    {
      icon: Clock,
      title: "Fast Production",
      subtitle: "3-5 day turnaround",
      gradient: "from-orange-400 to-amber-500"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="group relative bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 hover:bg-white/80 hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10 text-center">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 rounded-xl bg-gradient-to-r ${item.gradient} p-3 md:p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-full h-full text-white" />
                </div>
                <h3 className="font-poppins-tight font-bold text-sm md:text-base text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="font-poppins text-xs md:text-sm text-gray-600">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Section */}
        <div className="text-center bg-white/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/30">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-poppins-tight font-bold text-lg text-gray-900">4.9/5</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="font-poppins text-gray-700">50,000+ happy customers</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="font-poppins text-gray-700">SSL encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustElements;
