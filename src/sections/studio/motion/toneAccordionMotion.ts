import type { Transition, Variants } from 'framer-motion';

export const toneSectionSpring: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 28,
  mass: 0.8,
};

export const toneCardSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
  mass: 0.6,
};

export const toneChevonSpring: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 20,
  mass: 0.5,
};

export const toneSectionVariants: Variants = {
  collapsed: {
    opacity: 1,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  expanded: {
    opacity: 1,
    scale: 1,
    transition: toneSectionSpring,
  },
};

export const tonePanelVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      ...toneSectionSpring,
      when: 'beforeChildren',
    },
  },
};

export const toneCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: toneCardSpring,
  },
};

export const heroCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.96,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 22,
      mass: 0.7,
    },
  },
};

export const toneCardStagger = {
  staggerChildren: 0.05,
  delayChildren: 0.08,
};

export const reducedMotionSettings: Transition = {
  type: 'tween',
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

export const getStaggerOrNone = (prefersReducedMotion: boolean) =>
  prefersReducedMotion ? undefined : toneCardStagger;
