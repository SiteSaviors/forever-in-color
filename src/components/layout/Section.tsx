import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

const Section = ({ className, children, ...rest }: SectionProps) => (
  <section className={clsx('section-shell py-20', className)} {...rest}>
    {children}
  </section>
);

export default Section;
