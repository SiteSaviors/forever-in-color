
import { Monitor, Smartphone, Square } from "lucide-react";

export const getOrientationIcon = (orientation: string) => {
  switch (orientation) {
    case 'horizontal':
      return <Monitor className="w-8 h-8" />;
    case 'vertical':
      return <Smartphone className="w-8 h-8" />;
    case 'square':
      return <Square className="w-8 h-8" />;
    default:
      return <Monitor className="w-8 h-8" />;
  }
};
