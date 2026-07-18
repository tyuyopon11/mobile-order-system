"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import {
  defaultTransition,
  fadeUp,
  sectionFadeUp,
  viewportOnce,
} from "./lib/animations";

type SectionTitleProps = {
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
  variant?: "default" | "shops";
};

export default function SectionTitle({
  eyebrow,
  title,
  action,
  variant = "default",
}: SectionTitleProps) {
  const isShopsVariant = variant === "shops";

  return (
    <motion.div
      variants={isShopsVariant ? sectionFadeUp : fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={defaultTransition}
      className={
        isShopsVariant
          ? "flex flex-col justify-between gap-6 md:flex-row md:items-end"
          : undefined
      }
    >
      <div>
        <p
          className={
            isShopsVariant
              ? "text-xs font-medium tracking-[0.3em] text-[#7b877f]"
              : "text-xs font-medium tracking-[0.3em] text-[#7b877f]"
          }
        >
          {eyebrow}
        </p>

        {isShopsVariant ? (
          <h2 className="mt-5 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
            {title}
          </h2>
        ) : (
          <h2 className="mt-6 font-serif text-4xl leading-tight tracking-[-0.03em] md:text-6xl">
            {title}
          </h2>
        )}
      </div>

      {action}
    </motion.div>
  );
}