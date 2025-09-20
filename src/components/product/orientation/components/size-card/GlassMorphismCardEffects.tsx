
interface GlassMorphismCardEffectsProps {
  isSelected: boolean;
  isRecommended: boolean;
  cardState: "selected" | "recommended" | "default";
}

const GlassMorphismCardEffects = ({
  isSelected,
  isRecommended,
  cardState
}: GlassMorphismCardEffectsProps) => {
  return (
    <>
      {/* Enhanced selection effects with modern glow */}
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-3xl border-3 border-purple-400/70 pointer-events-none animate-pulse"></div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-400/20 via-violet-400/15 to-purple-400/20 blur-xl pointer-events-none animate-pulse"></div>
        </>
      )}
      
      {/* Enhanced recommended glow effect */}
      {isRecommended && !isSelected && (
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/20 via-yellow-400/15 to-amber-400/20 blur-lg pointer-events-none opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      {/* Enhanced hover effect for non-selected cards */}
      {!isSelected && (
        <div className={`
          absolute inset-0 rounded-3xl border-2 border-transparent transition-all duration-500 pointer-events-none
          ${cardState === "recommended" 
            ? 'group-hover:border-amber-300/70 group-hover:shadow-amber-200/50' 
            : 'group-hover:border-purple-200/70 group-hover:shadow-purple-200/50'
          }
        `}></div>
      )}
    </>
  );
};

export default GlassMorphismCardEffects;
