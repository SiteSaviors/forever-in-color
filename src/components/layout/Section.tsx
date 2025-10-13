import { clsx } from 'clsx';
import { ReactNode } from 'react';

type SectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

const Section = ({ id, className, children }: SectionProps) => (
  <section id={id} className={clsx('section-shell py-20', className)}>
    {children}
  </section>
);

export default Section;
