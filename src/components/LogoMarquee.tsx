
const LogoMarquee = () => {
  const logos = [
    { name: "TechCrunch", logo: "TC" },
    { name: "Forbes", logo: "FORBES" },
    { name: "Wired", logo: "WIRED" },
    { name: "Fast Company", logo: "FC" },
    { name: "The Verge", logo: "VERGE" },
    { name: "Mashable", logo: "M" },
    { name: "Business Insider", logo: "BI" },
    { name: "Inc.", logo: "INC" },
    { name: "Entrepreneur", logo: "ENT" },
    { name: "VentureBeat", logo: "VB" }
  ];

  return (
    <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Featured In
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {logos.map((publication, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
              >
                <div className="w-24 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs tracking-tight">
                    {publication.logo}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {logos.map((publication, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
              >
                <div className="w-24 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs tracking-tight">
                    {publication.logo}
                  </span>
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
