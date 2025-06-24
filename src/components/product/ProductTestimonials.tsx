
import { Badge } from "@/components/ui/badge";
import QuickStats from "./testimonials/QuickStats";
import FeaturedTestimonial from "./testimonials/FeaturedTestimonial";
import RecentReviews from "./testimonials/RecentReviews";

const ProductTestimonials = () => {
  const featuredTestimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      location: "San Francisco, CA",
      avatar: "🌸",
      rating: 5,
      date: "2 weeks ago",
      product: "Living Memory Canvas - Watercolor Dreams",
      title: "Absolutely magical experience",
      content: "I ordered this canvas of my late grandmother for Mother's Day. The Watercolor Dreams style captured her gentle spirit perfectly, and the Living Memory feature... I can't even describe the emotion when I heard her voice again. My family was in tears (happy ones!). This isn't just art - it's pure magic.",
      images: ["12x16", "Living Memory"],
      verified: true,
      helpful: 47
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      location: "Austin, TX",
      avatar: "🎨",
      rating: 5,
      date: "1 week ago",
      product: "Family Portrait - Classic Oil Painting",
      title: "Better than I ever imagined",
      content: "Ordered this as a surprise for our 10th anniversary. The Classic Oil Painting style made our family photo look like it belonged in a museum. The quality is incredible - you can see every brushstroke detail. My wife cried when she saw it. Worth every penny and more.",
      images: ["20x24", "Floating Frame"],
      verified: true,
      helpful: 32
    },
    {
      id: 3,
      name: "Jennifer Walsh",
      location: "Nashville, TN",
      avatar: "💕",
      rating: 5,
      date: "3 days ago",
      product: "Wedding Canvas - Pastel Bliss",
      title: "Our love story immortalized",
      content: "This canvas hangs above our bed and every morning we scan it to hear our wedding vows again. Three years later, it still gives us goosebumps. The Pastel Bliss style is so romantic and dreamy. The colors are vibrant and the quality is museum-grade. Highly recommend!",
      images: ["16x20", "Voice Match", "Living Memory"],
      verified: true,
      helpful: 28
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700">
            Customer Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See Why Families Love Their Canvases
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of families who have transformed their precious memories into living art
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Featured Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredTestimonials.map((testimonial) => (
            <FeaturedTestimonial key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Recent Reviews Stream */}
        <RecentReviews />
      </div>
    </section>
  );
};

export default ProductTestimonials;
