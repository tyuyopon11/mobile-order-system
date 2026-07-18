"use client";

import { motion } from "motion/react";

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
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.5,
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
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