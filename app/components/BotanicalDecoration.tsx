"use client";

import { motion } from "motion/react";

const paths = [
  "M402 941C389 783 400 646 453 504C497 386 562 286 662 180",
  "M447 517C346 469 294 389 284 277C382 310 442 393 447 517Z",
  "M508 391C503 280 545 194 637 124C664 228 620 323 508 391Z",
  "M410 682C319 642 260 571 235 468C337 489 399 565 410 682Z",
  "M563 290C556 201 591 130 667 72C689 155 655 228 563 290Z",
  "M397 829C326 803 274 749 242 669C329 677 385 733 397 829Z",
  "M456 548C541 516 611 527 681 583C600 622 524 611 456 548Z",
  "M428 694C507 665 576 677 638 730C562 763 492 750 428 694Z",
];

export default function BotanicalDecoration() {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 760 960"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{
        opacity: 0,
        x: 30,
      }}
      animate={{
        opacity: 0.16,
        x: 0,
        y: [0, -4, 0, 4, 0],
        rotate: [0, 0.15, 0, -0.15, 0],
      }}
      transition={{
        opacity: {
          duration: 1.2,
          delay: 0.35,
        },
        x: {
          duration: 1.4,
          delay: 0.35,
          ease: [0.22, 1, 0.36, 1],
        },
        y: {
          duration: 12,
          delay: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 16,
          delay: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className="pointer-events-none absolute -right-48 top-0 h-full w-auto max-w-none origin-bottom md:-right-12 lg:right-0"
    >
      {paths.map((path, index) => (
        <motion.path
          key={path}
          d={path}
          stroke="#26382F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          animate={{
            pathLength: 1,
            opacity: 1,
          }}
          transition={{
            pathLength: {
              duration: index === 0 ? 2.4 : 1.7,
              delay: 0.45 + index * 0.18,
              ease: [0.65, 0, 0.35, 1],
            },
            opacity: {
              duration: 0.35,
              delay: 0.45 + index * 0.18,
            },
          }}
        />
      ))}
    </motion.svg>
  );
}