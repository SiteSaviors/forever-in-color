
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Jennifer Davis",
    content: "The ordering process was so smooth and the final product exceeded my expectations!",
    rating: 5
  }
];

const OrderTestimonials = () => {
  return (
    <div className="py-8">
      <h3 className="text-2xl font-bold text-center mb-6">
        What Our Customers Say
      </h3>
      
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-lg italic mb-4">"{testimonials[0].content}"</p>
          <p className="font-semibold">- {testimonials[0].name}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTestimonials;
