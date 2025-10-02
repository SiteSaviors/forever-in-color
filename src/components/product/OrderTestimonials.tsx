
import { Star, Quote } from "@/components/ui/icons";
import { Card, CardContent } from "@/components/ui/card";

const OrderTestimonials = () => {
  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "The quality exceeded my expectations! The colors are so vibrant and the canvas feels premium.",
      location: "New York, NY"
    },
    {
      name: "Michael R.",
      rating: 5,
      text: "Perfect gift for my wife's birthday. She was in tears (happy ones!) when she saw our wedding photo transformed.",
      location: "Austin, TX"
    },
    {
      name: "Jennifer L.",
      rating: 5,
      text: "Fast shipping and amazing customer service. The AR feature is incredible - felt like magic!",
      location: "Los Angeles, CA"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
        What Our Customers Say
      </h3>
      <div className="space-y-3">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700 mb-2 italic">
                "{testimonial.text}"
              </p>
              <div className="text-xs text-gray-500">
                <span className="font-medium">{testimonial.name}</span> • {testimonial.location}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderTestimonials;
