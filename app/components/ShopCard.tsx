"use client";

import Link from "next/link";
import { motion } from "motion/react";

type ShopCardProps = {
  index: number;
  name: string;
  category: string;
  description: string;
  href: string;
  status: "OPEN" | "COMING SOON";
};

export default function ShopCard({
  index,
  name,
  category,
  description,
  href,
  status,
}: ShopCardProps) {
  const isOpen = status === "OPEN";

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      whileHover={
        isOpen
          ? {
              x: 8,
            }
          : undefined
      }
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group grid gap-6 py-9 md:grid-cols-[80px_1fr_1fr_160px] md:items-center md:py-11"
    >
      <span className="font-serif text-xl text-[#7b877f]">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div>
        <p className="text-[10px] tracking-[0.28em] text-[#7b877f]">
          {category}
        </p>

        <h3 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#26382f]">
          {name}
        </h3>
      </div>

      <p className="max-w-xl leading-8 text-[#5d6a62]">
        {description}
      </p>

      <div className="flex items-center justify-between gap-6 md:justify-end">
        <span
          className={
            isOpen
              ? "text-[10px] tracking-[0.24em] text-[#26382f]"
              : "text-[10px] tracking-[0.24em] text-[#969d98]"
          }
        >
          {status}
        </span>

        {isOpen ? (
          <Link
            href={href}
            aria-label={`${name}を開く`}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#26382f]/30 text-lg transition-all duration-300 group-hover:border-[#26382f] group-hover:bg-[#26382f] group-hover:text-white"
          >
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#26382f]/10 text-[#26382f]/25">
            —
          </span>
        )}
      </div>
    </motion.article>
  );
}