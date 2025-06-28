
interface ProductHeaderBackgroundProps {}

const ProductHeaderBackground = ({}: ProductHeaderBackgroundProps) => {
  return (
    <div className="absolute inset-0">
      {/* Animated gradient orbs */}
      <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-200/15 to-orange-300/15 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>
    </div>
  );
};

export default ProductHeaderBackground;
