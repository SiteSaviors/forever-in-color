
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "@/components/ui/icons";

const PopArtBurstTestimonials = () => {
  const testimonials = [
    {
      name: "Sarah M.",
      review: "My family photo became this incredible comic book masterpiece! The colors are so vibrant and fun.",
      rating: 5,
      location: "California"
    },
    {
      name: "Mike R.",
      review: "Perfect retro vibe for my office. Everyone asks where I got this amazing pop art piece!",
      rating: 5,
      location: "New York"
    },
    {
      name: "Lisa K.",
      review: "The halftone textures and bold outlines make it look like professional pop art. Love it!",
      rating: 5,
      location: "Texas"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600">Join thousands who've transformed their photos into pop art</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-white border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.review}"</p>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstTestimonials;
