"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type {
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";

const AnimatedLink = motion.create(Link);

type MotionLinkProps =
  ComponentPropsWithoutRef<typeof AnimatedLink> & {
    children: ReactNode;
  };

export default function MotionLink({
  children,
  ...props
}: MotionLinkProps) {
  return (
    <AnimatedLink {...props}>
      {children}
    </AnimatedLink>
  );
}