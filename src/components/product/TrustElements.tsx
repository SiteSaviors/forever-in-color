import { Truck, Shield, Award } from "lucide-react";

const TrustElements = () => {
  return (
    <div className="bg-background/95 backdrop-blur-sm border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-poppins-tight font-semibold text-sm sm:text-base text-foreground">Free Shipping</p>
              <p className="text-xs sm:text-sm text-muted-foreground">On orders over $75</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-poppins-tight font-semibold text-sm sm:text-base text-foreground">100% Secure</p>
              <p className="text-xs sm:text-sm text-muted-foreground">SSL encrypted checkout</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-poppins-tight font-semibold text-sm sm:text-base text-foreground">Premium Quality</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Museum-grade materials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustElements;