/**
 * Lei Port Marketplace
 * Motion Animation Presets
 *
 * Created by ChatGPT & Tyuyo
 */

export const fadeUp = {
  initial: {
    opacity: 0,
    y: 24,
  },
  whileInView: {
    opacity: 1,
    y: 0,
  },
  viewport: {
    once: true,
    amount: 0.25,
  },
  transition: {
    duration: 0.7,
    ease: "easeOut",
  },
};

export const fadeIn = {
  initial: {
    opacity: 0,
  },
  whileInView: {
    opacity: 1,
  },
  viewport: {
    once: true,
  },
  transition: {
    duration: 0.8,
  },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export const hoverCard = {
  whileHover: {
    y: -2,
    scale: 1.01,
    transition: {
      duration: 0.25,
    },
  },
};

export const hoverButton = {
  whileHover: {
    scale: 1.04,
  },
  whileTap: {
    scale: 0.98,
  },
};

export const growLine = {
  initial: {
    scaleY: 0,
    originY: 0,
  },
  whileHover: {
    scaleY: 1,
  },
  transition: {
    duration: 0.35,
  },
};

export const breathe = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.7, 1, 0.7],
  },
  transition: {
    duration: 2.8,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const floatingLeaf = {
  animate: {
    y: [0, -6, 0],
    rotate: [0, 1, 0],
  },
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  },
};