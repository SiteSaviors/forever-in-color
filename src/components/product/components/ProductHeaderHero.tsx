
import { useState, useEffect } from "react";
import { Crown } from "lucide-react";

interface ProductHeaderHeroProps {}

const ProductHeaderHero = ({}: ProductHeaderHeroProps) => {
  const [avgTime, setAvgTime] = useState(87);

  useEffect(() => {
    const interval = setInterval(() => {
      setAvgTime(prev => Math.min(120, Math.max(60, prev + Math.floor(Math.random() * 6) - 3)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-12">
      {/* Pre-headline - Benefit Hook */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 text-purple-600 font-medium text-lg">
          <Crown className="w-5 h-5" />
          Transform Any Photo Into Gallery-Quality Art
        </span>
      </div>

      {/* Main Headline - Emotional + Benefit */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.9]">
        <div className="bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text text-transparent mb-2">
          Your Photo
        </div>
        <div className="text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent font-black">
          REIMAGINED
        </div>
        <div className="text-2xl md:text-3xl lg:text-4xl text-gray-700 font-normal mt-4">
          in {avgTime} seconds by AI
        </div>
      </h1>

      {/* Enhanced Value Proposition */}
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
        Our AI transforms your precious memories into <span className="font-semibold text-purple-700">museum-grade canvas art</span> using 15 distinct artistic styles. No artistic skills required.
      </p>
    </div>
  );
};

export default ProductHeaderHero;
