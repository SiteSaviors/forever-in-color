
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  text: string;
  mobileText: string;
  rating: number;
}

interface TestimonialSectionProps {
  testimonials: Testimonial[];
}

const TestimonialSection = ({ testimonials }: TestimonialSectionProps) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Testimonial rotation
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(testimonialInterval);
  }, [testimonials.length]);

  return (
    <div className="flex justify-center mb-2 md:mb-3">
      <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-xl rounded-xl px-2 md:px-4 py-1 md:py-1.5 border border-white/20 shadow-xl max-w-xs md:max-w-lg mx-auto hover:scale-105 transition-all duration-200">
        <div className="flex items-center gap-1.5 md:gap-2.5 justify-between">
          {/* Stars on the left */}
          <div className="flex gap-0.5 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5 md:w-3 md:h-3 fill-yellow-400 text-yellow-400 animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
            ))}
          </div>
          
          {/* Testimonial text in center with mobile optimization */}
          <div className="text-center flex-grow min-w-0">
            <p className="text-white font-semibold text-xs md:text-sm mb-0.5 truncate">
              {/* Mobile-specific shorter testimonials */}
              <span className="md:hidden">
                "{testimonials[currentTestimonial].mobileText}"
              </span>
              <span className="hidden md:inline">
                "{testimonials[currentTestimonial].text}"
              </span>
            </p>
            <p className="text-white/80 text-xs">
              - {testimonials[currentTestimonial].name}
            </p>
          </div>
          
          {/* Small indicator on the right */}
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
