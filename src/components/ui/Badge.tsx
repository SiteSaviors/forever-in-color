import { clsx } from 'clsx';
import { HTMLAttributes } from 'react';

type BadgeVariant = 'brand' | 'glass' | 'emerald';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'badge-pill bg-white/15 text-white/80',
  glass: 'badge-pill bg-white text-slate-900',
  emerald: 'badge-pill bg-emerald-400/20 text-emerald-200 border border-emerald-300/40',
};

const Badge = ({ variant = 'brand', className, children, ...props }: BadgeProps) => (
  <span className={clsx(variantClasses[variant], className)} {...props}>
    {children}
  </span>
);

export default Badge;
