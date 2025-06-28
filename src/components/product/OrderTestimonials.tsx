
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const OrderTestimonials = () => {
  const testimonials = [
    {
      name: "Jennifer M.",
      location: "California",
      rating: 5,
      text: "The ordering process was so smooth, and the final canvas exceeded all my expectations. My grandmother looks like an angel in the watercolor style!",
      style: "Watercolor Dreams"
    },
    {
      name: "David K.", 
      location: "Texas",
      rating: 5,
      text: "Fast delivery, perfect quality. The oil painting style made our wedding photo look like it belongs in a museum. Highly recommend!",
      style: "Classic Oil Painting"
    },
    {
      name: "Maria L.",
      location: "New York", 
      rating: 5,
      text: "Customer service was amazing when I had questions about sizing. The 3D storybook style brought our family photo to life in the most beautiful way.",
      style: "3D Storybook"
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">What Our Customers Say</h3>
          <p className="text-gray-600">Join thousands of happy customers who love their custom canvases</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">{testimonial.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-purple-600 font-medium">{testimonial.style}</div>
                    </div>
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

export default OrderTestimonials;
