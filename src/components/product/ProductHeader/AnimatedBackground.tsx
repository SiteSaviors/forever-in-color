
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Floating orbs with staggered animations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-purple-600/15 rounded-full blur-3xl animate-pulse float-gentle"></div>
      <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-br from-pink-400/30 via-fuchsia-500/25 to-violet-600/20 rounded-full blur-2xl animate-pulse float-gentle" style={{animationDelay: '1s', animationDuration: '5s'}}></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-br from-emerald-400/25 via-teal-500/20 to-cyan-600/15 rounded-full blur-3xl animate-pulse float-gentle" style={{animationDelay: '2s', animationDuration: '7s'}}></div>
      
      {/* Animated particles - optimized */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '0s', animationDuration: '2.5s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1s', animationDuration: '3.5s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-pink-300/25 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '4.5s'}}></div>
      </div>
      
      {/* Enhanced Grid Pattern with optimized animation */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:24px_24px] opacity-40 animate-pulse" style={{animationDuration: '8s'}}></div>
    </div>
  );
};

export default AnimatedBackground;
