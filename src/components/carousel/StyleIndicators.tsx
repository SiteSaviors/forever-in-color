
interface StyleIndicatorsProps {
  totalCount: number;
  currentIndex: number;
  onIndicatorClick: (index: number) => void;
}

const StyleIndicators = ({ totalCount, currentIndex, onIndicatorClick }: StyleIndicatorsProps) => {
  return (
    <div className="flex justify-center mt-8 space-x-2">
      {Array.from({ length: totalCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => onIndicatorClick(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index === currentIndex
              ? 'bg-purple-600 scale-125'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
        />
      ))}
    </div>
  );
};

export default StyleIndicators;
