
import { useState } from "react";
import { Button } from "@/components/ui/button";

const PhoneMockup = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative">
      <div className="bg-gray-800 rounded-3xl p-2 shadow-2xl">
        <div className="bg-white rounded-2xl aspect-[9/19] overflow-hidden">
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isPlaying ? 'Pause' : 'Play'} Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
