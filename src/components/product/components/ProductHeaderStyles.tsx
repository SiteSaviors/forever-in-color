
interface ProductHeaderStylesProps {}

const ProductHeaderStyles = ({}: ProductHeaderStylesProps) => {
  return (
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes magical-glow {
        0%, 100% { opacity: 0.7; transform: scale(1); }
        50% { opacity: 0.9; transform: scale(1.05); }
      }
      @keyframes magical-particles {
        0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.8; }
        25% { transform: translateY(-10px) translateX(5px) scale(1.2); opacity: 1; }
        50% { transform: translateY(-20px) translateX(-5px) scale(0.8); opacity: 0.6; }
        75% { transform: translateY(-15px) translateX(8px) scale(1.1); opacity: 0.9; }
        100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.8; }
      }
    `}</style>
  );
};

export default ProductHeaderStyles;
