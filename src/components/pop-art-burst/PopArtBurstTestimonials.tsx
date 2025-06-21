
import { Star } from "lucide-react";

const PopArtBurstTestimonials = () => {
  const testimonials = [
    {
      name: "Marcus Chen",
      role: "Comic Book Fan",
      content: "This is EXACTLY what I wanted! My portrait looks like it belongs in a Marvel comic. The halftone effects are perfect!",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Sarah Rodriguez", 
      role: "Art Teacher",
      content: "My students are obsessed with this style. It's like having Roy Lichtenstein as your personal artist. Absolutely amazing results!",
      rating: 5,
      avatar: "SR"
    },
    {
      name: "Jake Thompson",
      role: "Pop Art Collector",
      content: "I've been collecting pop art for years, and this captures the authentic Warhol aesthetic perfectly. Incredible quality!",
      rating: 5,
      avatar: "JT"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-gray-900"
              style={{ textShadow: '2px 2px 0px #ef4444' }}>
            What Pop Art Fans Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who've transformed their photos into comic book masterpieces
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group">
              <div className="bg-white border-4 border-black p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl relative">
                {/* Comic book speech bubble tail */}
                <div className="absolute -top-4 left-8 w-8 h-8 bg-white border-l-4 border-t-4 border-black transform rotate-45"></div>
                
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-white border-2 border-black mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 font-medium">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed font-medium italic">
                  "{testimonial.content}"
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-yellow-400 border-4 border-black px-8 py-4 transform rotate-1">
            <p className="text-xl font-black text-black">
              ⭐ 4.9/5 stars from 12,000+ pop art creators
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstTestimonials;
