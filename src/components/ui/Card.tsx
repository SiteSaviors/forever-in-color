import { clsx } from 'clsx';
import { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  glass?: boolean;
};

const Card = ({ className, glass = false, ...props }: CardProps) => (
  <div
    className={clsx(
      glass ? 'glass-card backdrop-blur-md' : 'bg-white text-slate-900 rounded-[1.5rem] shadow-founder',
      className
    )}
    {...props}
  />
);

export default Card;
