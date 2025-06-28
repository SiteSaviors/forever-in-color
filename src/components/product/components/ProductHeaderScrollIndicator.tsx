
interface ProductHeaderScrollIndicatorProps {}

const ProductHeaderScrollIndicator = ({}: ProductHeaderScrollIndicatorProps) => {
  return (
    <div className="flex flex-col items-center mt-16 text-center">
      <div className="text-purple-600 font-medium text-lg mb-3">
        Choose Your Photo & Style Below ↓
      </div>
      <div className="w-6 h-10 border-2 border-purple-300 rounded-full flex justify-center">
        <div className="w-1 h-3 bg-purple-500 rounded-full mt-2 animate-bounce"></div>
      </div>
    </div>
  );
};

export default ProductHeaderScrollIndicator;
