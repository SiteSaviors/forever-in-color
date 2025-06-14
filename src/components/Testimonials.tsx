
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Portland, OR",
      rating: 5,
      text: "I commissioned a neon synthwave portrait of my late grandmother from an old family photo. The transformation was absolutely stunning - it brought such vibrant energy to her memory while still capturing her essence perfectly.",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face",
      artworkBefore: "Original family photo",
      artworkAfter: "Neon synthwave transformation",
      style: "Neon Synthwave"
    },
    {
      id: 2,
      name: "Mike Chen",
      location: "Austin, TX",
      rating: 5,
      text: "The watercolor style portrait of our rescue dog turned out better than I could have imagined. It's now the centerpiece of our living room, and everyone who visits asks about it. The quality is museum-grade!",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face",
      artworkBefore: "Photo of rescue dog",
      artworkAfter: "Watercolor masterpiece",
      style: "Watercolor Dreams"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      location: "Miami, FL",
      rating: 5,
      text: "I ordered a pop art style canvas of my daughter's graduation photo as a surprise gift. The colors are so vibrant and the framing is exceptional. She cried happy tears when she saw it - it's going straight to her new apartment!",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop&crop=face",
      artworkBefore: "Graduation photo",
      artworkAfter: "Pop art celebration",
      style: "Pop Art Burst"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What Our{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Customers
            </span>{" "}
            Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from customers who transformed their precious memories into stunning framed canvas artwork
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
            <div className="text-gray-600 text-sm">Average Rating</div>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">2,500+</div>
            <div className="text-gray-600 text-sm">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600 text-sm">Would Recommend</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">5K+</div>
            <div className="text-gray-600 text-sm">Artworks Created</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
              <CardContent className="p-8">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-purple-500 opacity-50" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-600 text-sm">({testimonial.rating}/5)</span>
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Artwork Details */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Style:</strong> {testimonial.style}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Transformation:</strong> {testimonial.artworkBefore} → {testimonial.artworkAfter}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Before/After Gallery Preview */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            See the{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Transformation
            </span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Transformation Examples */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop" 
                  alt="Original pet photo" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="text-sm text-gray-600 mb-2">Original Photo</div>
              <div className="text-lg font-semibold text-gray-900">→ Watercolor Dreams</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-purple-600">
                  <div className="text-sm mb-2">Family Portrait</div>
                  <div className="text-xs">Transformed to</div>
                  <div className="font-bold">Neon Synthwave</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Artistic Transformation</div>
              <div className="text-lg font-semibold text-purple-600">Museum Quality Canvas</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-blue-600">
                  <div className="text-sm mb-2">Special Moment</div>
                  <div className="text-xs">Becomes</div>
                  <div className="font-bold">Pop Art Masterpiece</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Framed & Ready</div>
              <div className="text-lg font-semibold text-blue-600">Perfect for Your Wall</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Create Your Masterpiece
          </button>
          <p className="text-gray-500 text-sm mt-3">Join thousands of satisfied customers</p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
