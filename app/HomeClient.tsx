"use client";

import { motion } from "motion/react";

import ConceptNumber from "./components/ConceptNumber";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import MotionLink from "./components/MotionLink";
import SectionTitle from "./components/SectionTitle";
import ShopCard from "./components/ShopCard";
import {
  createDelayTransition,
  fadeUp,
  viewportOnce,
} from "./components/lib/animations";

export type HomeShop = {
  name: string;
  category: string;
  description: string;
  href: string;
  status: "OPEN" | "COMING SOON";
};

export default function HomeClient({ shops }: { shops: HomeShop[] }) {
  const featuredShopHref = shops.find(
    (shop) =>
      shop.status === "OPEN" &&
      (shop.href.includes("takashimaya") || shop.name.includes("高島屋"))
  )?.href;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e8] text-[#25342c]">
      <Hero featuredShopHref={featuredShopHref} />

      {/* CONCEPT */}
      <section className="px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <SectionTitle
            eyebrow="OUR CONCEPT"
            title={
              <>
                商流をつなぎ、
                <br />
                価値を育てる。
              </>
            }
          />

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={createDelayTransition(0.15)}
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
          <SectionTitle
            eyebrow="SHOPS"
            title="Marketplace"
            variant="shops"
            action={
              <MotionLink
                href="/platform"
                className="group inline-flex items-center gap-4 text-sm tracking-[0.16em] text-[#26382f]"
              >
                すべてのショップを見る

                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </MotionLink>
            }
          />

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

      <Footer />
    </main>
  );
}
