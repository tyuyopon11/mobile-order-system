"use client";

import { motion } from "motion/react";

import {
  createDelayTransition,
  subtleFadeUp,
  viewportHalf,
} from "./lib/animations";

type ConceptNumberProps = {
  number: string;
  label: string;
  delay?: number;
};

export default function ConceptNumber({
  number,
  label,
  delay = 0,
}: ConceptNumberProps) {
  return (
    <motion.div
      variants={subtleFadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportHalf}
      transition={createDelayTransition(delay, 0.7)}
    >
      <p className="font-serif text-2xl text-[#26382f]">
        {number}
      </p>

      <p className="mt-2 text-[10px] tracking-[0.2em] text-[#7b877f]">
        {label}
      </p>
    </motion.div>
  );
}