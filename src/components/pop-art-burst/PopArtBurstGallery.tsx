
const PopArtBurstGallery = () => {
  const galleryImages = [
    {
      before: "/lovable-uploads/581d73aa-03e2-4173-838a-61286c6fb31c.png",
      after: "/lovable-uploads/722e9b7c-c3b0-4810-9b8b-317b1f9dc5df.png",
      title: "Portrait Pop"
    },
    {
      before: "/lovable-uploads/60a93ae3-c149-4515-aa89-356396b7ff33.png", 
      after: "/lovable-uploads/755c41d5-3b97-4a56-bdeb-ac8a77718919.png",
      title: "Comic Couple"
    },
    {
      before: "/lovable-uploads/58ce8c1f-4fcb-4135-a850-600a0915b141.png",
      after: "/lovable-uploads/926c93e6-a27d-48b4-aa84-9c3fa773bb4e.png", 
      title: "Pop Pet"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-yellow-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-gray-900"
              style={{ textShadow: '3px 3px 0px #ef4444, -1px -1px 0px #ef4444, 1px -1px 0px #ef4444, -1px 1px 0px #ef4444' }}>
            KAPOW! Gallery
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            See real photos transformed into comic book masterpieces
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {galleryImages.map((item, index) => (
            <div key={index} className="group">
              <div className="relative overflow-hidden border-6 border-black bg-white p-4 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <img 
                      src={item.before} 
                      alt="Original photo"
                      className="w-full h-48 object-cover rounded border-2 border-gray-300"
                    />
                    <p className="text-sm font-bold mt-2 bg-gray-200 px-2 py-1 rounded">BEFORE</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src={item.after} 
                      alt="Pop art transformation"
                      className="w-full h-48 object-cover rounded border-2 border-black"
                    />
                    <p className="text-sm font-bold mt-2 bg-gradient-to-r from-red-500 to-blue-500 text-white px-2 py-1 rounded">AFTER</p>
                  </div>
                </div>
                <h3 className="text-center mt-4 text-lg font-black text-gray-900">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-block bg-yellow-400 border-4 border-black px-8 py-4 transform -rotate-2">
            <p className="text-xl font-black text-black">
              Ready to join the pop art revolution? 🎨
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstGallery;
