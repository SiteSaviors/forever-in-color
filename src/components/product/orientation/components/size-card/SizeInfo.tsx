
import { useMemo } from "react";

interface SizeInfoProps {
  size: string;
}

const SizeInfo = ({ size }: SizeInfoProps) => {
  const roomContext = useMemo(() => {
    const contexts = {
      '8" x 8"': 'Perfect for desks & shelves',
      '12" x 12"': 'Ideal for gallery walls',
      '16" x 16"': 'Statement piece for any room',
      '20" x 20"': 'Bold focal point',
      '24" x 24"': 'Luxury centerpiece',
      '8" x 10"': 'Cozy personal spaces',
      '11" x 14"': 'Classic home display',
      '16" x 20"': 'Professional presentation',
      '18" x 24"': 'Impressive wall art',
      '24" x 36"': 'Grand statement piece',
      '10" x 8"': 'Modern accent piece',
      '14" x 11"': 'Sophisticated display',
      '20" x 16"': 'Eye-catching feature',
      '24" x 18"': 'Premium wall art',
      '36" x 24"': 'Luxury showcase'
    };
    return contexts[size as keyof typeof contexts] || 'Beautiful for any space';
  }, [size]);

  return (
    <div className="text-center space-y-2">
      <div className="bg-white/60 rounded-lg p-3 border border-white/30">
        <h5 className="font-bold text-gray-900 mb-1 text-2xl">{size}</h5>
        <p className="text-sm text-purple-600 font-medium">{roomContext}</p>
        <p className="text-xs text-gray-500">Premium Canvas</p>
      </div>
    </div>
  );
};

export default SizeInfo;
