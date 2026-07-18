"use client";

import { motion } from "motion/react";

import {
  fadeIn,
  footerTransition,
} from "./lib/animations";

export default function Footer() {
  return (
    <motion.footer
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={footerTransition}
      className="bg-[#26382f] px-6 py-16 text-[#f4f0e8] md:px-12 lg:px-20"
    >
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
        <div>
          <p className="font-serif text-3xl">
            Lei Port
          </p>

          <p className="mt-2 text-xs tracking-[0.22em] text-[#f4f0e8]/60">
            BtoB MARKETPLACE
          </p>
        </div>

        <div className="text-sm leading-7 text-[#f4f0e8]/65 md:text-right">
          <p>Operated by Tokyo Flower Port</p>

          <p className="mt-3 text-xs">
            © {new Date().getFullYear()} Lei Port Marketplace
          </p>
        </div>
      </div>
    </motion.footer>
  );
}