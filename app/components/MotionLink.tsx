"use client";

import Link, { type LinkProps } from "next/link";
import { motion } from "motion/react";
import type {
  AnchorHTMLAttributes,
  ReactNode,
} from "react";

const AnimatedLink = motion.create(Link);

type MotionLinkProps = LinkProps &
  Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof LinkProps
  > & {
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