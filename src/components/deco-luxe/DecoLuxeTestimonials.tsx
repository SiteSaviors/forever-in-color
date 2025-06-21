
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const DecoLuxeTestimonials = () => {
  const testimonials = [
    {
      name: "Alexandra M.",
      rating: 5,
      text: "The Deco Luxe style perfectly captured the elegance I was looking for. The geometric patterns and gold accents make it look like a piece from a luxury gallery."
    },
    {
      name: "James R.",
      rating: 5,
      text: "Absolutely stunning! The Art Deco influence combined with modern design creates such a sophisticated piece. Perfect for our anniversary gift."
    },
    {
      name: "Sofia L.",
      rating: 5,
      text: "The attention to detail is incredible. The metallic accents and clean lines give it such a high-end, editorial feel. Exactly what I envisioned."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="text-sm font-semibold text-gray-900">- {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeTestimonials;
