
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const PhoneMockup = () => {
  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
        <div className="bg-gray-900 rounded-[2rem] overflow-hidden">
          {/* Screen Content */}
          <div className="aspect-[9/19.5] bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 relative overflow-hidden">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-6 pt-4 pb-2">
              <span className="text-xs font-medium">9:41</span>
              <div className="flex space-x-1">
                <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                <div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
              </div>
            </div>
            
            {/* App Content */}
            <div className="px-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Your Canvas Preview</h3>
              
              {/* Mock Canvas */}
              <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/f0fb638f-ed49-4e86-aeac-0b87e27de424.png"
                  alt="Canvas preview"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium"
                >
                  Add to Cart - $89.99
                </motion.button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium">
                  Try Another Style
                </button>
              </div>
            </div>
            
            {/* Floating Sparkles */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-20 right-4"
            >
              <Sparkles className="w-6 h-6 text-purple-500" />
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -180, -360]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-32 left-4"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-[2.5rem] blur-xl -z-10"></div>
    </div>
  );
};

export default PhoneMockup;
