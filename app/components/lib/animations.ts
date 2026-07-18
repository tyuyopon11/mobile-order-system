import type { Transition, Variants } from "motion/react";

export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const viewportOnce = {
  once: true,
  amount: 0.3,
} as const;

export const viewportHalf = {
  once: true,
  amount: 0.5,
} as const;

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const sectionFadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const cardFadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const subtleFadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
};

export const defaultTransition: Transition = {
  duration: 0.9,
  ease: premiumEase,
};

export const cardTransition: Transition = {
  duration: 0.7,
  ease: premiumEase,
};

export const footerTransition: Transition = {
  duration: 1,
};

export function createDelayTransition(
  delay = 0,
  duration = 0.9,
): Transition {
  return {
    duration,
    delay,
    ease: premiumEase,
  };
}

export function createCardTransition(index: number): Transition {
  return {
    duration: 0.7,
    delay: index * 0.08,
    ease: premiumEase,
  };
}