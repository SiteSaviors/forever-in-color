
const PhotoFrames = () => {
  const frames = [
    { id: 1, style: "Classic", image: "/placeholder-frame-1.jpg" },
    { id: 2, style: "Modern", image: "/placeholder-frame-2.jpg" },
    { id: 3, style: "Vintage", image: "/placeholder-frame-3.jpg" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {frames.map((frame) => (
        <div key={frame.id} className="group relative overflow-hidden rounded-lg">
          <div className="aspect-square bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">{frame.style} Frame</span>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
      ))}
    </div>
  );
};

export default PhotoFrames;
