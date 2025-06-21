
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const ThreeDStorybookTestimonials = () => {
  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "My daughter absolutely loves her 3D character! It looks just like her but in the most adorable cartoon way. The big eyes and playful features make it so charming."
    },
    {
      name: "Mike R.",
      rating: 5,
      text: "Perfect for our playroom! The colors are so vibrant and the quality is amazing. It really does look like something from a Pixar movie."
    },
    {
      name: "Jenny L.",
      rating: 5,
      text: "Such a unique gift idea! Everyone who sees it can't stop smiling. The 3D effect is incredible and the personality really shines through."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
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

export default ThreeDStorybookTestimonials;
