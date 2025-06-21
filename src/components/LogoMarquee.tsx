
const LogoMarquee = () => {
  const logos = [
    {
      name: "Better Homes & Gardens",
      logo: "/lovable-uploads/99bc67a2-db73-461a-91ec-a2b13565cb4e.png"
    },
    {
      name: "BuzzFeed",
      logo: "/lovable-uploads/19467b45-97f1-4e2c-9e42-fa8310544287.png"
    },
    {
      name: "People",
      logo: "/lovable-uploads/3e54fa0e-71b8-4028-a9ff-a11131833695.png"
    },
    {
      name: "Variety",
      logo: "/lovable-uploads/628203b0-48a9-4be5-9498-b86e351364cc.png"
    },
    {
      name: "Inc.",
      logo: "/lovable-uploads/5f25233c-019d-49a0-845d-3cbfb34eb465.png"
    }
  ];

  return (
    <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">AS FEATURED IN</p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {logos.map((publication, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 mx-8 flex items-center justify-center">
                <div className="w-32 h-16 flex items-center justify-center">
                  <img 
                    src={publication.logo} 
                    alt={publication.name}
                    className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                  />
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {logos.map((publication, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 mx-8 flex items-center justify-center">
                <div className="w-32 h-16 flex items-center justify-center">
                  <img 
                    src={publication.logo} 
                    alt={publication.name}
                    className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Gradient overlays for fade effect */}
          <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white/50 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white/50 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
