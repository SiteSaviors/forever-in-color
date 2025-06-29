
import { Button } from "@/components/ui/button";

const ARCallToAction = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-900 to-pink-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Experience AR Magic?
        </h2>
        <p className="text-xl mb-8 text-purple-100">
          Transform your space with personalized art that comes alive in augmented reality.
        </p>
        <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
          Start Your AR Journey
        </Button>
      </div>
    </section>
  );
};

export default ARCallToAction;
