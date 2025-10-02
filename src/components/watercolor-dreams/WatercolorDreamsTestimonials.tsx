
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "@/components/ui/icons";

const WatercolorDreamsTestimonials = () => {
  const testimonials = [
    {
      name: "Marcus Thompson",
      location: "Austin, TX",
      quote: "The bold, expressive style perfectly captured the energy of our family vacation. It's like having a piece of pure joy on our wall that makes everyone smile.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Sofia Chen",
      location: "San Francisco, CA", 
      quote: "I love how vibrant and alive this style makes everything look. The dramatic brushstrokes turned my pet's portrait into a true work of art that guests always comment on.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332a7c9?w=60&h=60&fit=crop&crop=face"
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
                <Quote className="w-8 h-8 text-pink-600 mb-4" />
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

export default WatercolorDreamsTestimonials;
