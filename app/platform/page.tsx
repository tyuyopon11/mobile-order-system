import Link from "next/link";

import BotanicalDecoration from "@/app/components/BotanicalDecoration";
import { createClient } from "@/lib/supabase/server";
import { SHOP_PUBLICATION_COLUMN } from "@/lib/shops/publication";

type Shop = {
  id: string | number;
  slug: string;
  shop_name: string;
  description: string | null;
  logo_url: string | null;
};

type ShopBranding = {
  label: string;
  catchCopy: string;
  supportingText: string;
  features: string[];
  accentClass: string;
  labelClass: string;
  buttonClass: string;
  fallbackIcon: string;
};

function getShopBranding(shop: Shop): ShopBranding {
  const searchableText =
    `${shop.slug ?? ""} ${shop.shop_name ?? ""}`.toLowerCase();

  const isTakashimaya =
    searchableText.includes("takashimaya") ||
    searchableText.includes("高島屋");

  const isHorticulture =
    searchableText.includes("engei") ||
    searchableText.includes("園芸") ||
    searchableText.includes("exhibition");

  if (isTakashimaya) {
    return {
      label: "SPECIAL",
      catchCopy: "目利きのプロが選ぶ、ここにしかない一鉢。",
      supportingText:
        "一鉢ごとに異なる樹形や表情を見極め、空間の主役となる植物をご紹介します。",
      features: [
        "目利きのプロが厳選",
        "特殊樹形・大型観葉",
        "一点物・希少植物",
      ],
      accentClass: "border-amber-200",
      labelClass: "bg-amber-50 text-amber-800 ring-amber-200",
      buttonClass:
        "bg-stone-900 text-white group-hover:bg-stone-700",
      fallbackIcon: "🌳",
    };
  }

  if (isHorticulture) {
    return {
      label: "SEASONAL",
      catchCopy: "季節を先取りする植物マーケット。",
      supportingText:
        "旬の植物から、これからの売場づくりにつながるおすすめ商品まで、一足先にご提案します。",
      features: [
        "季節のおすすめ植物",
        "新品種・新商品",
        "事前予約・先行販売",
      ],
      accentClass: "border-green-200",
      labelClass: "bg-green-50 text-green-800 ring-green-200",
      buttonClass:
        "bg-green-700 text-white group-hover:bg-green-800",
      fallbackIcon: "🌿",
    };
  }

  return {
    label: "SHOP",
    catchCopy:
      shop.description || "植物との新しい出会いをお届けします。",
    supportingText:
      "東京フラワーポートが提案する、植物のための専門ショップです。",
    features: [
      "厳選された商品",
      "植物の魅力を丁寧に紹介",
      "買参人向けBtoB販売",
    ],
    accentClass: "border-stone-200",
    labelClass: "bg-stone-100 text-stone-700 ring-stone-200",
    buttonClass:
      "bg-green-700 text-white group-hover:bg-green-800",
    fallbackIcon: "🌱",
  };
}

export default async function PlatformPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("shops")
    .select("id, slug, shop_name, description, logo_url")
    .eq(SHOP_PUBLICATION_COLUMN, true)
    .eq("show_on_public_site", true)
    .order("display_order", { ascending: true });

  const shops = (data ?? []) as Shop[];
  const { data: favoriteRows } = user
    ? await supabase
        .from("favorite_shops")
        .select("shop_id")
        .eq("user_id", user.id)
    : { data: [] };
  const favoriteIds = new Set(
    (favoriteRows ?? []).map((row) => String(row.shop_id))
  );
  const favoriteShops = shops.filter((shop) =>
    favoriteIds.has(String(shop.id))
  );

  if (error) {
    return (
      <main className="min-h-screen bg-[#f4f0e8] px-5 py-8 text-[#25342c]">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">
            ショップの取得に失敗しました
          </h1>

          <p className="mt-3 text-sm leading-7 text-red-600">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e8] text-[#25342c]">
      <section className="relative border-b border-[#26382f]/15 px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <BotanicalDecoration />
        <div className="relative mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-xs font-medium tracking-[0.2em] text-[#536159] transition hover:text-[#26382f]"
          >
            <span aria-hidden="true">←</span>
            LEI PORT
          </Link>
          <p className="mt-16 text-xs font-medium tracking-[0.38em] text-[#66746c] sm:text-sm">
            BtoB MARKETPLACE
          </p>
          <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3rem,8vw,7rem)] leading-[0.92] tracking-[-0.05em] text-[#26382f]">
            Lei Port Marketplace
          </h1>
          <div className="mt-9 h-px w-24 bg-[#26382f]/40" />
          <p className="mt-7 font-serif text-2xl leading-relaxed text-[#26382f] sm:text-3xl">
            植物の価値を、もっと伝わる価値へ。
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#536159] sm:text-base">
            東京フラワーポートが運営する植物流通プラットフォーム。
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {favoriteShops.length > 0 && (
          <section className="mb-14 border-y border-[#26382f]/15 py-5 sm:mb-20">
            <p className="text-xs font-bold tracking-[0.16em] text-green-800">
              お気に入りショップ
            </p>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {favoriteShops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/platform/shops/${shop.slug}`}
                  className="shrink-0 border border-[#26382f]/25 bg-white/45 px-4 py-2 text-sm font-semibold text-[#26382f] transition hover:bg-white/80"
                >
                  {shop.shop_name}
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* Shop introduction */}
        <section className="mb-10 border-b border-[#26382f]/15 pb-8 sm:mb-12 sm:flex sm:items-end sm:justify-between sm:text-left">
          <div>
          <p className="text-xs font-medium tracking-[0.3em] text-[#66746c] sm:text-sm">
            OUR SHOPS
          </p>

          <h2 className="mt-3 font-serif text-3xl tracking-tight text-[#26382f] sm:text-4xl">
            ショップを選ぶ
          </h2>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#536159] sm:mt-0 sm:text-right sm:text-base">
            それぞれの専門性を持つショップから、
            <br className="hidden sm:block" />
            あなたに合った植物との出会いをお楽しみください。
          </p>
        </section>

        {/* Shop cards */}
        {shops.length > 0 ? (
          <section className="grid gap-6 md:grid-cols-2">
            {shops.map((shop) => {
              const branding = getShopBranding(shop);

              return (
                <Link
                  key={shop.id}
                  href={`/platform/shops/${shop.slug}`}
                  className={`group relative flex min-h-full flex-col overflow-hidden rounded-xl border bg-white/75 shadow-[0_8px_30px_rgba(38,56,47,0.04)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(38,56,47,0.08)] ${branding.accentClass}`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-stone-50 transition duration-500 group-hover:scale-125"
                  />

                  <div className="relative flex h-full flex-col p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] ring-1 ring-inset ${branding.labelClass}`}
                      >
                        {branding.label}
                      </span>

                      <span
                        aria-hidden="true"
                        className="text-xl text-gray-300 transition duration-300 group-hover:translate-x-1 group-hover:text-gray-500"
                      >
                        ↗
                      </span>
                    </div>

                    <div className="mt-6 flex justify-center">
                      {shop.logo_url ? (
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-stone-100 sm:h-36 sm:w-36">
                          <img
                            src={shop.logo_url}
                            alt={`${shop.shop_name} ロゴ`}
                            className="block h-full w-full rounded-full object-contain object-center"
                          />
                        </div>
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-stone-50 text-5xl shadow-inner ring-1 ring-stone-100 sm:h-36 sm:w-36">
                          {branding.fallbackIcon}
                        </div>
                      )}
                    </div>

                    <div className="mt-7 text-center">
                      <h3 className="font-serif text-2xl tracking-tight text-[#26382f] sm:text-3xl">
                        {shop.shop_name}
                      </h3>

                      <p className="mt-4 text-lg font-bold leading-8 text-gray-800 sm:text-xl">
                        {branding.catchCopy}
                      </p>

                      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-600">
                        {branding.supportingText}
                      </p>
                    </div>

                    <div className="my-7 h-px bg-stone-100" />

                    <ul className="space-y-3">
                      {branding.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm font-medium text-gray-700 sm:text-base"
                        >
                          <span
                            aria-hidden="true"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700"
                          >
                            ✓
                          </span>

                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      <span
                        className={`flex min-h-12 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition duration-300 ${branding.buttonClass}`}
                      >
                        ショップを見る
                        <span
                          aria-hidden="true"
                          className="ml-2 transition duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <div className="text-4xl" aria-hidden="true">
              🌿
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              現在公開中のショップはありません
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              ショップの準備が整い次第、こちらに表示されます。
            </p>
          </section>
        )}

        <footer className="mt-14 border-t border-[#26382f]/15 py-8 text-center sm:mt-20">
          <p className="text-xs tracking-[0.12em] text-gray-500">
            Tokyo Flower Port
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Lei Port Marketplace Ver.1.1
          </p>
        </footer>
      </div>
    </main>
  );
}
