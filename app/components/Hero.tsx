"use client";

import Link from "next/link";
import { motion } from "motion/react";

import BotanicalDecoration from "./BotanicalDecoration";

const MotionLink = motion.create(Link);

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden border-b border-[#25342c]/10 px-6 py-20 md:px-12 lg:px-20">
      <BotanicalDecoration />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-4xl">
          <motion.p
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-6 text-xs font-medium tracking-[0.38em] text-[#66746c] md:text-sm"
          >
            BtoB MARKETPLACE
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1
              initial={{
                opacity: 0,
                y: 80,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-serif text-[clamp(3.2rem,10vw,8.8rem)] leading-[0.88] tracking-[-0.055em] text-[#26382f]"
            >
              Lei Port
            </motion.h1>
          </div>

          <div className="overflow-hidden pb-2">
            <motion.h2
              initial={{
                opacity: 0,
                y: 65,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1,
                delay: 0.42,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-3 font-serif text-[clamp(2rem,6vw,5.4rem)] leading-none tracking-[-0.04em] text-[#26382f]/90"
            >
              Marketplace
            </motion.h2>
          </div>

          <motion.div
            initial={{
              scaleX: 0,
            }}
            animate={{
              scaleX: 1,
            }}
            transition={{
              duration: 0.8,
              delay: 0.72,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-10 h-px w-24 origin-left bg-[#26382f]/40"
          />

          <motion.p
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.82,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 max-w-2xl text-lg leading-9 text-[#536159] md:text-xl"
          >
            東京フラワーポートに関わる
            <br className="hidden sm:block" />
            Businessを育てるためのBtoB Marketplace。
          </motion.p>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.9,
              delay: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-5 font-serif text-2xl italic tracking-wide text-[#26382f] md:text-3xl"
          >
            Business grows Business.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.9,
              delay: 1.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-12 flex flex-col gap-4 sm:flex-row"
          >
            <MotionLink
              href="/platform"
              className="group inline-flex min-h-14 items-center justify-center gap-5 bg-[#26382f] px-8 text-sm font-medium tracking-[0.2em] text-white transition-colors duration-300 hover:bg-[#3a5044]"
            >
              <span>MARKETPLACE</span>

              <motion.span
                className="inline-block"
                initial={{
                  x: 0,
                }}
                whileHover={{
                  x: 0,
                }}
                aria-hidden="true"
              >
                →
              </motion.span>
            </MotionLink>

            <MotionLink
              href="/platform/shops/takashimaya"
              className="group inline-flex min-h-14 items-center justify-center gap-5 border border-[#26382f]/30 px-8 text-sm font-medium tracking-[0.16em] text-[#26382f] transition-colors duration-300 hover:border-[#26382f] hover:bg-white/40"
            >
              <span>高島屋植物園を見る</span>

              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </MotionLink>
          </motion.div>
        </div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: 1.5,
          }}
          className="mt-20 flex items-center gap-4 text-xs tracking-[0.26em] text-[#7b877f]"
        >
          <span>SCROLL</span>

          <motion.span
            animate={{
              scaleX: [1, 0.55, 1],
              opacity: [0.45, 1, 0.45],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-px w-16 origin-left bg-[#7b877f]/70"
          />
        </motion.div>
      </div>
    </section>
  );
}