
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ARHero = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <Badge className="bg-purple-100 text-purple-800">
            Augmented Reality Experience
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            See Your Art in AR
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience your personalized artwork in your actual space before you buy. 
            Our AR technology lets you visualize how your art will look on your walls.
          </p>
          
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
            Try AR Preview
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ARHero;
