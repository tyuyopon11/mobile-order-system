"use client";

import Link from "next/link";
import { motion } from "motion/react";

import ConceptNumber from "./components/ConceptNumber";
import Hero from "./components/Hero";
import ShopCard from "./components/ShopCard";

const shops = [
  {
    name: "高島屋植物園",
    category: "SELECTED PLANTS",
    description:
      "大型観葉植物や特殊樹形を中心に、一鉢ごとの個性を楽しめる植物をセレクト。",
    href: "/platform/shops/takashimaya",
    status: "OPEN" as const,
  },
  {
    name: "園芸部展示販売",
    category: "GARDEN EXHIBITION",
    description:
      "季節の鉢花や観葉植物を、展示会形式で提案するBtoB販売ショップ。",
    href: "/platform",
    status: "COMING SOON" as const,
  },
  {
    name: "切花部展示販売",
    category: "FLOWER EXHIBITION",
    description:
      "産地と買参人をつなぎ、新しい切花の販売機会を生み出すショップ。",
    href: "/platform",
    status: "COMING SOON" as const,
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
      <Hero />

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
                <ConceptNumber
                  number="01"
                  label="CONNECT"
                  delay={0}
                />

                <ConceptNumber
                  number="02"
                  label="GROW"
                  delay={0.1}
                />

                <ConceptNumber
                  number="03"
                  label="EXPAND"
                  delay={0.2}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SHOPS */}
      <section className="border-y border-[#26382f]/10 bg-[#ebe5da] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
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
            {shops.map((shop, index) => (
              <ShopCard
                key={shop.name}
                index={index}
                name={shop.name}
                category={shop.category}
                description={shop.description}
                href={shop.href}
                status={shop.status}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <motion.footer
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
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
    </main>
  );
}