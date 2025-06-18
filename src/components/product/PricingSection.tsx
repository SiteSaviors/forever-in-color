
import { Check, Frame, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PricingSection = () => {
  const framedPrices = [
    { size: '16" x 12"', orientation: 'Horizontal', price: 159.99 },
    { size: '24" x 18"', orientation: 'Horizontal', price: 199.99 },
    { size: '36" x 24"', orientation: 'Horizontal', price: 249.99 },
    { size: '40" x 30"', orientation: 'Horizontal', price: 319.99 },
    { size: '48" x 32"', orientation: 'Horizontal', price: 449.99 },
    { size: '60" x 40"', orientation: 'Horizontal', price: 599.99 },
    { size: '12" x 16"', orientation: 'Vertical', price: 159.99 },
    { size: '18" x 24"', orientation: 'Vertical', price: 199.99 },
    { size: '24" x 36"', orientation: 'Vertical', price: 249.99 },
    { size: '30" x 40"', orientation: 'Vertical', price: 319.99 },
    { size: '32" x 48"', orientation: 'Vertical', price: 449.99 },
    { size: '40" x 60"', orientation: 'Vertical', price: 599.99 },
    { size: '16" x 16"', orientation: 'Square', price: 179.99 },
    { size: '24" x 24"', orientation: 'Square', price: 219.99 },
    { size: '32" x 32"', orientation: 'Square', price: 349.99 },
    { size: '36" x 36"', orientation: 'Square', price: 499.99 },
  ];

  const unframedPrices = [
    { size: '16" x 12"', orientation: 'Horizontal', price: 109.99 },
    { size: '24" x 18"', orientation: 'Horizontal', price: 149.99 },
    { size: '36" x 24"', orientation: 'Horizontal', price: 199.99 },
    { size: '40" x 30"', orientation: 'Horizontal', price: 269.99 },
    { size: '48" x 32"', orientation: 'Horizontal', price: 349.00 },
    { size: '60" x 40"', orientation: 'Horizontal', price: 499.99 },
    { size: '12" x 16"', orientation: 'Vertical', price: 109.99 },
    { size: '18" x 24"', orientation: 'Vertical', price: 149.99 },
    { size: '24" x 36"', orientation: 'Vertical', price: 199.99 },
    { size: '30" x 40"', orientation: 'Vertical', price: 269.99 },
    { size: '32" x 48"', orientation: 'Vertical', price: 349.00 },
    { size: '40" x 60"', orientation: 'Vertical', price: 499.99 },
  ];

  const PriceGrid = ({ prices, isFramed }: { prices: typeof framedPrices; isFramed: boolean }) => {
    const groupedPrices = prices.reduce((acc, item) => {
      if (!acc[item.orientation]) {
        acc[item.orientation] = [];
      }
      acc[item.orientation].push(item);
      return acc;
    }, {} as Record<string, typeof prices>);

    return (
      <div className="space-y-8">
        {Object.entries(groupedPrices).map(([orientation, items]) => (
          <div key={orientation}>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{orientation}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900">{item.size}</span>
                      <span className="text-xl font-bold text-purple-600">${item.price}</span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      size="sm"
                    >
                      Select Size
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Perfect Size
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Select from our range of canvas sizes. All prints feature 1.25" depth premium canvas.
          </p>
        </div>

        {/* Pricing Tabs */}
        <Tabs defaultValue="framed" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="framed" className="flex items-center gap-2">
              <Frame className="w-4 h-4" />
              Framed
            </TabsTrigger>
            <TabsTrigger value="unframed" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Unframed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="framed">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Framed Canvas Prints</h3>
              <p className="text-gray-600">Premium canvas with professional framing</p>
            </div>
            <PriceGrid prices={framedPrices} isFramed={true} />
          </TabsContent>

          <TabsContent value="unframed">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unframed Canvas Prints</h3>
              <p className="text-gray-600">Ready-to-hang canvas prints without frames</p>
            </div>
            <PriceGrid prices={unframedPrices} isFramed={false} />
          </TabsContent>
        </Tabs>

        {/* Trust Elements */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Free shipping on all orders</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day satisfaction guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Premium 1.25" depth canvas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
