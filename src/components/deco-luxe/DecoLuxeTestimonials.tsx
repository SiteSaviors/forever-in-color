
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const DecoLuxeTestimonials = () => {
  const testimonials = [
    {
      name: "Victoria Sterling",
      location: "Manhattan, NY",
      quote: "The Deco Luxe style transformed our wedding photo into a stunning piece of art that belongs in a luxury hotel lobby. The geometric patterns and gold accents are absolutely breathtaking.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Alexander Chen",
      location: "Beverly Hills, CA", 
      quote: "This is museum-quality artwork. The sophisticated Art Deco styling gives our family portrait such elegance and timeless appeal. It's the centerpiece of our living room.",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-16 bg-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-stone-800 mb-12 font-serif">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gradient-to-b from-white to-amber-50 border-2 border-amber-200/50 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
              <CardContent className="pt-0 relative">
                {/* Art Deco corner decorations */}
                <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-amber-400/40"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-amber-400/40"></div>
                
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <Quote className="w-6 h-6 text-white" />
                </div>
                <p className="text-stone-700 mb-6 italic text-center leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center justify-center">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-amber-400/50"
                  />
                  <div className="text-center">
                    <div className="font-semibold text-stone-800">{testimonial.name}</div>
                    <div className="text-stone-500 text-sm">{testimonial.location}</div>
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

export default DecoLuxeTestimonials;
