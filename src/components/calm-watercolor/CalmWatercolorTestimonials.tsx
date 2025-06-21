
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const CalmWatercolorTestimonials = () => {
  const testimonials = [
    {
      name: "Emma Rodriguez",
      location: "Seattle, WA",
      quote: "The soft watercolor style captured the gentle spirit of our newborn perfectly. It feels like a peaceful dream on our nursery wall.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "David Park",
      location: "Portland, OR", 
      quote: "Such a calming presence in our living room. The delicate brushwork and soft tones create the most serene atmosphere.",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <CardContent className="pt-0">
                <Quote className="w-8 h-8 text-blue-600 mb-4" />
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

export default CalmWatercolorTestimonials;
