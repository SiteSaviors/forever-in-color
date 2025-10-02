
import { Heart, Users, Clock } from "@/components/ui/icons";

const EmotionalJourney = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-pink-50 rounded-full px-4 py-2 mb-8">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span className="text-sm font-medium text-pink-700">Real Stories, Real Magic</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gray-900">More Than Art. </span>
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              It's Love Made Visible.
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every canvas tells a story. Every scan brings back a moment. These aren't just pictures
            —they're portals to the memories that matter most.
          </p>
        </div>

        {/* Story Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">The Last Photo</h3>
            <p className="text-gray-600 leading-relaxed italic">
              "Sarah wished she had one more moment with her grandmother. Now, 
              every morning, she scans the QR code and watches Grandma's gentle smile 
              come alive—her voice, her laugh, her love filling the room again."
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Growing Up Too Fast</h3>
            <p className="text-gray-600 leading-relaxed italic">
              "Mom, look how small I was!" Emma's daughter gasps as the canvas reveals 
              her first steps, those tiny hands reaching forward. Time may move 
              forward, but some moments deserve to live forever."
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Four Paws, One Heart</h3>
            <p className="text-gray-600 leading-relaxed italic">
              "Max may have crossed the rainbow bridge, but his tail still wags in the living 
              room. His family gathers around the canvas, watching him chase butterflies 
              one more time, keeping his spirit alive."
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            What Story Will Your Memory Tell?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Every moment matters. Every memory deserves to live forever. Transform 
            your most precious photos into living art that keeps love alive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
              <Heart className="w-4 h-4 fill-white" />
              <span>Start Your Story</span>
            </button>
            <span className="text-sm text-gray-500">Join 15,000+ families preserving their memories</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmotionalJourney;
