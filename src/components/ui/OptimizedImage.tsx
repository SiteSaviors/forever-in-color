
import { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
  quality?: number;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  priority, 
  quality, 
  ...props 
}: OptimizedImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      {...props}
    />
  );
};

export default OptimizedImage;
