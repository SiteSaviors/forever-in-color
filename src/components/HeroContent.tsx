
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroContent = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          AI-Powered Art Creation
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Transform Your Photos Into Stunning Art
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Upload any photo and watch our AI create beautiful artwork in multiple styles. 
          From oil paintings to modern abstracts - make every memory a masterpiece.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          Start Creating Art
        </Button>
        <Button variant="outline" size="lg">
          See Examples
        </Button>
      </div>
    </div>
  );
};

export default HeroContent;
