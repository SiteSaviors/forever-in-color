
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "@/components/ui/icons";

const NeonSplashTestimonials = () => {
  const testimonials = [
    {
      name: "Alex Rivera",
      location: "Miami, FL",
      quote: "This style is pure energy! My gaming setup looks incredible with this electric art on the wall. Everyone who sees it is blown away.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Maya Chen",
      location: "Los Angeles, CA", 
      quote: "Bold, rebellious, and absolutely stunning. The neon colors pop off the canvas and light up my entire studio space.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gray-800 border-gray-700">
              <CardContent className="pt-0">
                <Quote className="w-8 h-8 text-pink-500 mb-4" />
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeonSplashTestimonials;
