interface StyleCardPillsProps {
  styleId: number;
  isHorizontalOrientation?: boolean;
}

const StyleCardPills = ({ styleId, isHorizontalOrientation: _isHorizontalOrientation = false }: StyleCardPillsProps) => {
  const getStylePills = (styleId: number) => {
    const pillConfigs: {
      [key: number]: {
        pills: Array<{
          text: string;
          gradient: string;
        }>;
      };
    } = {
      1: {
        pills: [{
          text: "Original",
          gradient: "from-gray-500 to-gray-700"
        }]
      },
      2: {
        pills: [{
          text: "Classic",
          gradient: "from-amber-500 to-orange-600"
        }, {
          text: "Refined",
          gradient: "from-yellow-500 to-amber-600"
        }]
      },
      4: {
        pills: [{
          text: "Serene",
          gradient: "from-blue-500 to-cyan-600"
        }, {
          text: "Abstract",
          gradient: "from-orange-500 to-red-600"
        }]
      },
      5: {
        pills: [{
          text: "Dreamy",
          gradient: "from-pink-500 to-rose-600"
        }, {
          text: "Soft",
          gradient: "from-purple-500 to-pink-600"
        }]
      },
      6: {
        pills: [{
          text: "Geometric",
          gradient: "from-emerald-500 to-teal-600"
        }, {
          text: "Modern",
          gradient: "from-green-500 to-emerald-600"
        }]
      },
      7: {
        pills: [{
          text: "Whimsical",
          gradient: "from-blue-500 to-indigo-600"
        }, {
          text: "3D",
          gradient: "from-cyan-500 to-blue-600"
        }]
      },
      8: {
        pills: [{
          text: "Artistic",
          gradient: "from-slate-600 to-gray-700"
        }, {
          text: "Textured",
          gradient: "from-gray-600 to-slate-700"
        }]
      },
      9: {
        pills: [{
          text: "Bold",
          gradient: "from-pink-600 to-rose-700"
        }, {
          text: "Vibrant",
          gradient: "from-fuchsia-600 to-pink-700"
        }]
      },
      10: {
        pills: [{
          text: "Electric",
          gradient: "from-green-500 to-emerald-600"
        }, {
          text: "Neon",
          gradient: "from-lime-500 to-green-600"
        }]
      },
      11: {
        pills: [{
          text: "Dynamic",
          gradient: "from-purple-600 to-violet-700"
        }, {
          text: "Bloom",
          gradient: "from-indigo-600 to-purple-700"
        }]
      },
      13: {
        pills: [{
          text: "Abstract",
          gradient: "from-blue-600 to-indigo-700"
        }, {
          text: "Fusion",
          gradient: "from-cyan-600 to-blue-700"
        }]
      },
      15: {
        pills: [{
          text: "Luxe",
          gradient: "from-yellow-600 to-amber-700"
        }, {
          text: "Deco",
          gradient: "from-amber-600 to-orange-700"
        }]
      }
    };
    return pillConfigs[styleId] || {
      pills: [{
        text: "Style",
        gradient: "from-gray-500 to-gray-700"
      }]
    };
  };

  const styleConfig = getStylePills(styleId);

  return (
    <div className="flex flex-wrap gap-2 mb-2.5">
      {styleConfig.pills.map((pill, index) => (
        <div
          key={index}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${pill.gradient} shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
        >
          {pill.text}
        </div>
      ))}
    </div>
  );
};

export default StyleCardPills;
