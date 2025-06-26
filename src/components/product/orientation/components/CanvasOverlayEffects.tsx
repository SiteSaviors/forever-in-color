
interface CanvasOverlayEffectsProps {
  variant: 'interactive' | 'morphing' | 'simple';
  isSelected: boolean;
}

const CanvasOverlayEffects = ({ variant, isSelected }: CanvasOverlayEffectsProps) => {
  if (variant !== 'morphing') return null;

  return (
    <>
      {/* Glass Reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 rounded-xl z-20 pointer-events-none" />

      {/* Premium Border Effect */}
      <div className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 ${
        isSelected ? 'border-gradient-to-r from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30' : 'border-transparent group-hover:border-purple-300/50'
      }`} />

      {/* Holographic Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-30" />
    </>
  );
};

export default CanvasOverlayEffects;
