
const PhotoFrames = () => {
  // Frame data for consistent structure
  const frameData = [
    {
      id: 1,
      position: "absolute left-2 sm:-left-20 top-4 sm:top-8 transform -rotate-12 z-10",
      image: "/lovable-uploads/b95a4d7b-b543-461e-926f-14769697918a.png",
      alt: "Elderly couple art example",
      title: "3D Storybook",
      colors: ["bg-orange-400", "bg-red-400", "bg-pink-400"],
      gradient: "from-orange-200 via-red-200 to-pink-200"
    },
    {
      id: 2,
      position: "absolute left-1/2 transform -translate-x-1/2 -top-6 sm:-top-4 rotate-3 z-20",
      image: "/lovable-uploads/f0fb638f-ed49-4e86-aeac-0b87e27de424.png",
      alt: "Watercolor art example",
      title: "Watercolor Dreams",
      colors: ["bg-pink-400", "bg-purple-400", "bg-blue-400"],
      gradient: "from-pink-200 via-purple-200 to-blue-200"
    },
    {
      id: 3,
      position: "absolute right-2 sm:-right-20 top-4 sm:top-8 transform rotate-12 z-10",
      image: "/lovable-uploads/a26ed917-b49a-4495-a156-102b083bafd4.png",
      alt: "Vibrant pop art style couple",
      title: "Neon Splash",
      colors: ["bg-cyan-400", "bg-blue-400", "bg-purple-400"],
      gradient: "from-cyan-200 via-blue-200 to-purple-200"
    },
    {
      id: 4,
      position: "absolute left-4 sm:-left-20 top-40 sm:top-72 transform -rotate-12 z-30",
      image: "/lovable-uploads/55c1363e-f80a-482b-8adc-a129075dced5.png",
      alt: "Minimalist art style couple",
      title: "Classic Oil Painting",
      colors: ["bg-green-400", "bg-emerald-400", "bg-teal-400"],
      gradient: "from-green-200 via-emerald-200 to-teal-200"
    },
    {
      id: 5,
      position: "absolute right-4 sm:-right-20 top-40 sm:top-72 transform rotate-12 z-30",
      image: "/lovable-uploads/581d73aa-03e2-4173-838a-61286c6fb31c.png",
      alt: "Vintage film art style couple",
      title: "Abstract Fusion",
      colors: ["bg-amber-400", "bg-orange-400", "bg-yellow-400"],
      gradient: "from-amber-200 via-orange-200 to-yellow-200"
    }
  ];

  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm sm:max-w-none">
      {frameData.map((frame) => (
        <div key={frame.id} className={frame.position}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-6 w-24 h-32 sm:w-64 sm:h-72">
            <div className={`aspect-square bg-gradient-to-br ${frame.gradient} rounded-xl sm:rounded-2xl mb-1 sm:mb-4 overflow-hidden`}>
              <img 
                src={frame.image} 
                alt={frame.alt} 
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl" 
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[8px] sm:text-sm font-medium text-gray-600">
                {frame.title}
              </div>
              <div className="flex space-x-0.5 sm:space-x-1">
                {frame.colors.map((color, index) => (
                  <div key={index} className={`w-1 h-1 sm:w-3 sm:h-3 ${color} rounded-full`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoFrames;
