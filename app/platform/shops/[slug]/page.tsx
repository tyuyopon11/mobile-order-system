import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import ProductCatalog from "@/components/product/ProductCatalog";
import FavoriteShopButton from "@/app/platform/favorites/FavoriteShopButton";
import { createClient } from "@/lib/supabase/server";
import { getShop, getShopItems } from "@/lib/shop";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

type ShopBrand = {
  eyebrow: string;
  catchCopy: string;
  subCopy: string;
  collectionTitle: string;
  collectionDescription: string;
};

function getShopBrand(shopName: string, slug: string): ShopBrand {
  const normalizedName = shopName.toLowerCase();
  const normalizedSlug = slug.toLowerCase();

  const isTakashimaya =
    normalizedName.includes("高島屋") ||
    normalizedSlug.includes("takashimaya");

  if (isTakashimaya) {
    return {
      eyebrow: "SELECTED PLANTS",
      catchCopy: "目利きのプロが選ぶ、ここにしかない一鉢。",
      subCopy:
        "樹形、幹、葉の表情まで。一鉢ごとの個性を見極めて選んだ植物をご紹介します。",
      collectionTitle: "Plant Collection",
      collectionDescription:
        "同じ品種でも、同じ姿の植物はありません。それぞれの表情をゆっくりご覧ください。",
    };
  }

  return {
    eyebrow: "CIRQNEX SHOP",
    catchCopy: "植物の価値と出会うマーケット。",
    subCopy:
      "季節の植物や新しい品種など、ショップが選んだおすすめの商品をご紹介します。",
    collectionTitle: "Collection",
    collectionDescription:
      "植物の姿や特徴を見ながら、気になる一鉢をお選びください。",
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const parsedPage = Number(query.page || "1");
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? Math.floor(parsedPage)
      : 1;

  const shop = await getShop(slug);

  if (!shop) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: favorite } = user
    ? await supabase
        .from("favorite_shops")
        .select("shop_id")
        .eq("user_id", user.id)
        .eq("shop_id", shop.id)
        .maybeSingle()
    : { data: null };

  const { items, totalCount, totalPages } = await getShopItems(
    shop.id,
    currentPage,
    15
  );

  const brand = getShopBrand(shop.shop_name, shop.slug);
  const safeTotalPages = Math.max(totalPages, 1);

  const createPageUrl = (page: number) =>
    `/platform/shops/${shop.slug}?page=${page}`;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#25342c]">
      <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <div className="mb-6">
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-green-800"
          >
            <span aria-hidden="true">←</span>
            CIRQNEX
          </Link>
        </div>

        <section className="relative overflow-hidden border-y border-[#26382f]/15 bg-white/35">
          {shop.banner_url && (
            <>
              <Image
                src={shop.banner_url}
                alt=""
                fill
                priority
                sizes="(max-width: 1440px) 100vw, 1344px"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-stone-950/45 via-stone-950/55 to-stone-950/70"
                aria-hidden="true"
              />
            </>
          )}

          <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <p
                className={`text-xs font-semibold tracking-[0.3em] sm:text-sm ${
                  shop.banner_url ? "text-green-100" : "text-green-800"
                }`}
              >
                {brand.eyebrow}
              </p>

              {shop.logo_url ? (
                <div
                  className={`relative mt-8 h-36 w-36 overflow-hidden rounded-2xl sm:h-44 sm:w-44 ${
                    shop.banner_url
                      ? "border border-white/60 bg-white/90 shadow-xl backdrop-blur-sm"
                      : ""
                  }`}
                >
                  <Image
                    src={shop.logo_url}
                    alt={`${shop.shop_name} ロゴ`}
                    fill
                    sizes="176px"
                    className="object-contain p-3"
                  />
                </div>
              ) : (
                <div
                  className={`mt-8 flex h-36 w-36 items-center justify-center rounded-full text-5xl sm:h-44 sm:w-44 ${
                    shop.banner_url
                      ? "border border-white/60 bg-white/90 shadow-xl backdrop-blur-sm"
                      : "bg-green-50"
                  }`}
                >
                  🌿
                </div>
              )}

              <h1
                className={`mt-8 font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl ${
                  shop.banner_url
                    ? "text-white drop-shadow-md"
                    : "text-stone-900"
                }`}
              >
                {shop.shop_name}
              </h1>

              <p
                className={`mt-7 text-xl font-medium leading-relaxed sm:text-2xl ${
                  shop.banner_url
                    ? "text-white drop-shadow-sm"
                    : "text-stone-800"
                }`}
              >
                {brand.catchCopy}
              </p>

              <p
                className={`mt-5 max-w-2xl text-sm leading-7 sm:text-base ${
                  shop.banner_url ? "text-stone-100" : "text-stone-500"
                }`}
              >
                {shop.description || brand.subCopy}
              </p>
            </div>
          </div>
        </section>

        {shop.announcement && (
          <section className="mb-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 sm:px-6">
            <p className="text-xs font-bold tracking-[0.16em] text-green-800">
              ショップからのお知らせ
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
              {shop.announcement}
            </p>
          </section>
        )}

        {user && (
          <div className="mb-6 flex justify-end">
            <FavoriteShopButton shopId={shop.id} initialFavorite={Boolean(favorite)} />
          </div>
        )}

        <section className="pb-14 pt-14 sm:pb-20 sm:pt-20">
          <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
                COLLECTION
              </p>

              <h2 className="mt-3 font-serif text-3xl tracking-tight text-[#26382f] sm:text-4xl">
                {brand.collectionTitle}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
                {brand.collectionDescription}
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-stone-500">
              <span>{totalCount} Plants</span>

              {totalCount > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-stone-300" />
                  <span>
                    {currentPage} / {safeTotalPages}
                  </span>
                </>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="text-4xl">🌿</div>

              <p className="mt-5 text-lg font-medium text-stone-700">
                現在ご案内できる植物はありません。
              </p>

              <p className="mt-2 text-sm text-stone-500">
                新しい植物が登録されるまで、しばらくお待ちください。
              </p>
            </div>
          ) : (
            <ProductCatalog items={items} />
          )}

          {totalPages > 1 && (
            <nav
              aria-label="商品一覧ページ"
              className="mt-12 flex items-center justify-center gap-3 sm:mt-16"
            >
              {currentPage > 1 ? (
                <Link
                  href={createPageUrl(currentPage - 1)}
                  className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition hover:border-green-800 hover:text-green-800"
                >
                  ← 前へ
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-full border border-stone-200 bg-stone-100 px-6 py-3 text-sm font-medium text-stone-400">
                  ← 前へ
                </span>
              )}

              <span className="px-3 text-sm font-medium text-stone-500">
                {currentPage} / {safeTotalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={createPageUrl(currentPage + 1)}
                  className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition hover:border-green-800 hover:text-green-800"
                >
                  次へ →
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-full border border-stone-200 bg-stone-100 px-6 py-3 text-sm font-medium text-stone-400">
                  次へ →
                </span>
              )}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
