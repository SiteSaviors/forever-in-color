import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type PricingSectionProps = {
  children: ReactNode;
  className?: string;
};

const PricingSection = ({ children, className }: PricingSectionProps) => (
  <div
    className={clsx(
      'pricing-section relative animate-fadeIn opacity-100 transition-all duration-500 motion-reduce:animate-none motion-reduce:duration-0',
      className
    )}
  >
    {children}
  </div>
);

export default PricingSection;
