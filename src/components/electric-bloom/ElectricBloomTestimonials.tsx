
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "@/components/ui/icons";

const ElectricBloomTestimonials = () => {
  const testimonials = [
    {
      name: "Jordan Tech",
      location: "San Francisco, CA",
      quote: "The Electric Bloom style is absolutely mesmerizing! It transformed my portrait into something that looks like it belongs in a cyberpunk movie. The glow effects are incredible.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Nova Sterling",
      location: "New York, NY", 
      quote: "This style perfectly captures that futuristic aesthetic I was looking for. The electric aura effect makes it look like my photo is electrified - absolutely stunning for my modern apartment.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-16 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-slate-700 border-slate-600">
              <CardContent className="pt-0">
                <Quote className="w-8 h-8 text-blue-400 mb-4" />
                <p className="text-slate-300 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-slate-400 text-sm">{testimonial.location}</div>
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

export default ElectricBloomTestimonials;
