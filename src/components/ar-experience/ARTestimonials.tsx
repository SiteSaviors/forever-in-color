
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Heart } from 'lucide-react';

const ARTestimonials = () => {
  const testimonials = [
    {
      quote: "I thought I'd never hear my father's laugh again. When I scanned the QR code and heard his voice telling that old story... I broke down in tears. It's like he's still here with us.",
      author: "Sarah M.",
      relationship: "Daughter",
      emotion: "💔➡️❤️",
      background: "from-blue-50 to-purple-50"
    },
    {
      quote: "Our wedding canvas hangs in our bedroom, and every morning we scan it to hear our vows again. Three years later, it still gives us chills. It's not just a photo — it's our love story alive.",
      author: "Michael & Lisa T.",
      relationship: "Newlyweds",
      emotion: "💒",
      background: "from-pink-50 to-rose-50"
    },
    {
      quote: "When we lost Max, I thought the house would never feel the same. Now when friends visit, they scan his canvas and hear him barking. Everyone says they can feel his spirit in the room.",
      author: "Jennifer K.",
      relationship: "Pet Parent",
      emotion: "🐕❤️",
      background: "from-green-50 to-teal-50"
    }
  ];

  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">More Than Art — It's Presence</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            These aren't just customer reviews. These are stories of connection, healing, and love brought back to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className={`bg-gradient-to-br ${testimonial.background} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <Quote className="w-8 h-8 text-purple-600" />
                  <div className="text-2xl">{testimonial.emotion}</div>
                </div>
                <blockquote className="text-gray-700 italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600 text-sm">{testimonial.relationship}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-lg italic">
            "It's more than art — it's a living memory."
          </p>
        </div>
      </div>
    </section>
  );
};

export default ARTestimonials;
