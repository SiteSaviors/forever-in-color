
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Emma Wilson",
    content: "The AR preview saved me from making a sizing mistake. Perfect!",
    rating: 5
  }
];

const ARTestimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          Customer Experiences
        </h2>
        
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg italic mb-4">"{testimonials[0].content}"</p>
            <p className="font-semibold">- {testimonials[0].name}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ARTestimonials;
