
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const ArtisticMashupTestimonials = () => {
  const testimonials = [
    {
      name: "Maya Johnson",
      location: "Austin, TX",
      quote: "This style is everything I didn't know I needed! It's like having a professional artist create a custom collage of my memories. The layers and textures make it feel so alive and personal.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Diego Rivera",
      location: "Los Angeles, CA", 
      quote: "Perfect for my creative space! The Artistic Mashup style captures the chaotic beauty of life—bold, emotional, and completely unique. It's not just art, it's a conversation starter.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 border-orange-200">
              <CardContent className="pt-0">
                <Quote className="w-8 h-8 text-orange-600 mb-4" />
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
  );
};

export default ArtisticMashupTestimonials;
