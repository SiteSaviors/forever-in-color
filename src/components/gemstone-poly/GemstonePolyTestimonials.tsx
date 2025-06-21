
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const GemstonePolyTestimonials = () => {
  const testimonials = [
    {
      name: "Elena Rodriguez",
      location: "Miami, FL",
      quote: "This style is absolutely stunning! The geometric patterns and crystal-like facets make my pet's portrait look like a piece of contemporary art. It's modern, sophisticated, and gets compliments from everyone who sees it.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Jordan Kim",
      location: "Seattle, WA", 
      quote: "Perfect for my modern apartment! The Gemstone Poly style turned our couple's photo into something that looks like it belongs in a high-end gallery. The colors are vibrant and the geometric design is mesmerizing.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gradient-to-br from-purple-800/40 to-blue-800/40 border-cyan-400/20 backdrop-blur-sm">
              <CardContent className="pt-0">
                <Quote className="w-8 h-8 text-cyan-400 mb-4" />
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

export default GemstonePolyTestimonials;
