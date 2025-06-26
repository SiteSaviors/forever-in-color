
import { Square, Monitor, Smartphone } from "lucide-react";

export const orientationOptions = [
  {
    id: 'square',
    name: 'Square',
    ratio: 1,
    icon: Square,
    description: 'Perfect for social media & symmetric art',
    dimensions: '1:1'
  },
  {
    id: 'horizontal',
    name: 'Horizontal',
    ratio: 4 / 3,
    icon: Monitor,
    description: 'Ideal for landscapes & wide shots',
    dimensions: '4:3'
  },
  {
    id: 'vertical',
    name: 'Vertical',
    ratio: 3 / 4,
    icon: Smartphone,
    description: 'Best for portraits & tall compositions',
    dimensions: '3:4'
  }
];

export const getAspectRatioFromOrientation = (orientation: string) => {
  switch (orientation) {
    case 'vertical':
      return 3 / 4;
    case 'horizontal':
      return 4 / 3;
    case 'square':
    default:
      return 1;
  }
};
