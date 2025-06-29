
import { Card, CardContent } from "@/components/ui/card";

const ARWhatIs = () => {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          What is AR Preview?
        </h2>
        
        <Card>
          <CardContent className="p-8">
            <p className="text-lg text-gray-600 text-center">
              Augmented Reality (AR) Preview lets you see exactly how your personalized artwork 
              will look in your actual space before making a purchase. Simply point your phone 
              camera at your wall and see your art come to life in real-time.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ARWhatIs;
