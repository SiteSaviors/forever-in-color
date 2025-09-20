
import React from 'react';
import { Brain, Mic, Palette, Shield } from 'lucide-react';

const ARHowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">The Magic Behind the Memory</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You choose the video details — we bring it to life with heart. Our AI-powered technology creates authentic, emotional experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced AI Video Generation</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Brain className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Intelligent Motion Analysis</h4>
                  <p className="text-gray-600">Our AI studies your photo to create natural, lifelike movement patterns</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Mic className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Voice Recreation (Optional)</h4>
                  <p className="text-gray-600">Upload a voice sample, and we'll recreate speech with emotional authenticity</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Palette className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Sound Design</h4>
                  <p className="text-gray-600">Ambient sounds and effects that match the mood and setting of your memory</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <p className="text-purple-700 font-medium">Sample Video Preview</p>
                <p className="text-purple-600 text-sm">Interactive demo coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Quality Assurance */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">Your Memories, Protected</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Complete Privacy</h4>
              <p className="text-gray-600 text-sm">Your photos and voice samples are processed securely and never shared</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Quality Guaranteed</h4>
              <p className="text-gray-600 text-sm">Every video is reviewed to ensure it honors your memory with dignity</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Your Control</h4>
              <p className="text-gray-600 text-sm">You approve every aspect before we create your final canvas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ARHowItWorks;
