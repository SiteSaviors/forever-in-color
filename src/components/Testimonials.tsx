
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Austin, TX",
      rating: 5,
      text: "I ordered a watercolor canvas of my grandmother for Mother's Day. When my mom saw it, she cried happy tears. It captured not just her face, but her spirit. Absolutely magical!",
      image: "/lovable-uploads/b95a4d7b-b543-461e-926f-14769697918a.png"
    },
    {
      name: "Michael Chen",
      location: "Seattle, WA", 
      rating: 5,
      text: "The 3D Storybook style transformed our wedding photo into something that looks like it belongs in a fairy tale. Friends keep asking where we got it done!",
      image: "/lovable-uploads/f0fb638f-ed49-4e86-aeac-0b87e27de424.png"
    },
    {
      name: "Emily Rodriguez",
      location: "Miami, FL",
      rating: 5,
      text: "Lost our beloved dog last year. The Classic Oil Painting style made him look so regal and eternal. It's hanging in our living room and brings us comfort every day.",
      image: "/lovable-uploads/55c1363e-f80a-482b-8adc-a129075dced5.png"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Stories That Touch Hearts
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real customers sharing how their memories became masterpieces
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Join thousands of happy customers who've turned their photos into art
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
