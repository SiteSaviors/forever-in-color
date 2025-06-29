
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    content: "Amazing service! The AI transformed my family photo into a beautiful oil painting.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mike Chen",
    content: "Quick delivery and excellent quality. Highly recommended!",
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentTestimonial] = useState(0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center">What Our Customers Say</h2>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-lg italic">"{testimonials[currentTestimonial].content}"</p>
              <p className="font-semibold">- {testimonials[currentTestimonial].name}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Testimonials;
