import { useState, useEffect } from "react";
import StreamlinedProgress from "./components/StreamlinedProgress";
import CustomerPhotoMarquee from "./components/CustomerPhotoMarquee";
import LiveActivityBar from "./ProductHeader/LiveActivityBar";
import TestimonialSection from "./ProductHeader/TestimonialSection";
import HeaderContent from "./ProductHeader/HeaderContent";
import TrustIndicators from "./ProductHeader/TrustIndicators";
import AnimatedBackground from "./ProductHeader/AnimatedBackground";
import "./styles/heroAnimations.css";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
  currentStep?: number;
  onUploadClick?: () => void;
}

const ProductHeader = ({
  completedSteps,
  totalSteps,
  currentStep = 1,
  onUploadClick
}: ProductHeaderProps) => {
  const progressPercentage = completedSteps.length / totalSteps * 100;
  const [liveUsers, setLiveUsers] = useState(423);
  const [recentOrders, setRecentOrders] = useState(12);

  // Live testimonials for social proof rotation
  const liveTestimonials = [
    { 
      name: "Sarah M.", 
      text: "Just received my canvas - absolutely stunning!", 
      mobileText: "Canvas looks amazing!",
      rating: 5 
    },
    { 
      name: "Mike R.", 
      text: "The AI style transformation exceeded my expectations!", 
      mobileText: "AI results exceeded expectations!",
      rating: 5 
    },
    { 
      name: "Emma L.", 
      text: "Customer service was incredible, delivery was fast!", 
      mobileText: "Great service & fast delivery!",
      rating: 5 
    },
    { 
      name: "David K.", 
      text: "Museum quality - looks amazing in our living room!", 
      mobileText: "Museum quality results!",
      rating: 5 
    }
  ];

  // Enhanced live activity simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 7) - 3);
      if (Math.random() > 0.4) {
        setRecentOrders(prev => prev + 1);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900 relative overflow-hidden">
      {/* Enhanced Animated Background Effects */}
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 lg:py-10 relative z-10">
        {/* Phase 2: Mobile-Optimized Live Activity Bar with Single-Line Layout */}
        <LiveActivityBar liveUsers={liveUsers} progressPercentage={progressPercentage} />

        {/* Phase 3: Mobile-Optimized Horizontal Inline Testimonial */}
        <TestimonialSection testimonials={liveTestimonials} />

        {/* Enhanced Header Content with Phase 1 Mobile CTA Optimization */}
        <HeaderContent progressPercentage={progressPercentage} onUploadClick={onUploadClick} />

        {/* Customer Photo Marquee - Social Proof */}
        <div className="mb-6 md:mb-10">
          <CustomerPhotoMarquee />
        </div>

        {/* Progress - Only show when needed */}
        {progressPercentage > 0 && (
          <div className="mb-6 md:mb-10 animate-fade-in">
            <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />
          </div>
        )}

        {/* Trust Indicators */}
        <TrustIndicators />
      </div>
    </div>
  );
};

export default ProductHeader;
