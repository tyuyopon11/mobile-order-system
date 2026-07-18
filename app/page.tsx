"use client";

import Link from "next/link";
import { motion } from "motion/react";

const shops = [
  {
    name: "高島屋植物園",
    category: "SELECTED PLANTS",
    description:
      "大型観葉植物や特殊樹形を中心に、一鉢ごとの個性を楽しめる植物をセレクト。",
    href: "/platform/shops/takashimaya",
    status: "OPEN",
  },
  {
    name: "園芸部展示販売",
    category: "GARDEN EXHIBITION",
    description:
      "季節の鉢花や観葉植物を、展示会形式で提案するBtoB販売ショップ。",
    href: "/platform",
    status: "COMING SOON",
  },
  {
    name: "切花部展示販売",
    category: "FLOWER EXHIBITION",
    description:
      "産地と買参人をつなぎ、新しい切花の販売機会を生み出すショップ。",
    href: "/platform",
    status: "COMING SOON",
  },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e8] text-[#25342c]">
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden border-b border-[#25342c]/10 px-6 py-20 md:px-12 lg:px-20">
        <BotanicalDecoration />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
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
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
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
                initial={{ opacity: 0, y: 65 }}
                animate={{ opacity: 1, y: 0 }}
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
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.72,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-10 h-px w-24 origin-left bg-[#26382f]/40"
            />

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
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
                  initial={{ x: 0 }}
                  whileHover={{ x: 0 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

      {/* CONCEPT */}
      <section className="px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="text-xs font-medium tracking-[0.3em] text-[#7b877f]">
              OUR CONCEPT
            </p>

            <h2 className="mt-6 font-serif text-4xl leading-tight tracking-[-0.03em] md:text-6xl">
              商流をつなぎ、
              <br />
              価値を育てる。
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-end"
          >
            <div className="max-w-2xl">
              <p className="text-lg leading-9 text-[#536159]">
                Lei Portは、単なる販売サイトではありません。
                生産者、市場、仲卸、買参人、法人が持つ価値をひとつの場所につなぎ、
                新しい販売機会と継続的なBusinessを生み出すためのプラットフォームです。
              </p>

              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[#26382f]/15 pt-8">
                <ConceptNumber number="01" label="CONNECT" delay={0} />
                <ConceptNumber number="02" label="GROW" delay={0.1} />
                <ConceptNumber number="03" label="EXPAND" delay={0.2} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SHOPS */}
      <section className="border-y border-[#26382f]/10 bg-[#ebe5da] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
          >
            <div>
              <p className="text-xs font-medium tracking-[0.3em] text-[#7b877f]">
                SHOPS
              </p>

              <h2 className="mt-5 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                Marketplace
              </h2>
            </div>

            <Link
              href="/platform"
              className="group inline-flex items-center gap-4 text-sm tracking-[0.16em] text-[#26382f]"
            >
              すべてのショップを見る
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </motion.div>

          <div className="mt-14 divide-y divide-[#26382f]/15 border-y border-[#26382f]/15">
            {shops.map((shop, index) => {
              const isOpen = shop.status === "OPEN";

              return (
                <motion.article
                  key={shop.name}
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
                      {shop.category}
                    </p>

                    <h3 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#26382f]">
                      {shop.name}
                    </h3>
                  </div>

                  <p className="max-w-xl leading-8 text-[#5d6a62]">
                    {shop.description}
                  </p>

                  <div className="flex items-center justify-between gap-6 md:justify-end">
                    <span
                      className={
                        isOpen
                          ? "text-[10px] tracking-[0.24em] text-[#26382f]"
                          : "text-[10px] tracking-[0.24em] text-[#969d98]"
                      }
                    >
                      {shop.status}
                    </span>

                    {isOpen ? (
                      <Link
                        href={shop.href}
                        aria-label={`${shop.name}を開く`}
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
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{
          once: true,
          amount: 0.25,
        }}
        transition={{
          duration: 1,
        }}
        className="bg-[#26382f] px-6 py-16 text-[#f4f0e8] md:px-12 lg:px-20"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="font-serif text-3xl">Lei Port</p>

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
    </main>
  );
}

const MotionLink = motion.create(Link);

function ConceptNumber({
  number,
  label,
  delay,
}: {
  number: string;
  label: string;
  delay: number;
}) {
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
      <p className="font-serif text-2xl text-[#26382f]">{number}</p>

      <p className="mt-2 text-[10px] tracking-[0.2em] text-[#7b877f]">
        {label}
      </p>
    </motion.div>
  );
}

function BotanicalDecoration() {
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