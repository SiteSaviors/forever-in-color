
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const EmbroideredMomentsTestimonials = () => {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      location: "Nashville, TN",
      quote: "This embroidered style is absolutely perfect for our family room! It captures the warmth and love of our family photo while giving it that handmade charm I've always loved. It's like having a custom heirloom.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      location: "Portland, OR", 
      quote: "Got this as a gift for my grandmother's 90th birthday. The embroidered texture makes it feel so personal and crafted with love. She absolutely treasures it—says it reminds her of the quilts she used to make.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-16 bg-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-white border-amber-200">
              <CardContent className="pt-0">
                <Quote className="w-8 h-8 text-amber-600 mb-4" />
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
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

export default EmbroideredMomentsTestimonials;
