import Link from "next/link";
import { notFound } from "next/navigation";

import ProductCard from "@/components/product/ProductCard";
import { getShop, getShopItems } from "@/lib/shop";
import { getShopTheme } from "@/lib/shop-theme";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

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

  const { items, totalCount, totalPages } =
    await getShopItems(shop.id, currentPage, 30);

  const theme = getShopTheme(shop);
  const safeTotalPages = Math.max(totalPages, 1);

  const createPageUrl = (page: number) =>
    `/platform/shops/${shop.slug}?page=${page}`;

  return (
    <main className="min-h-screen bg-[#f5f4ef]">
      <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <div className="mb-6">
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-green-800"
          >
            <span aria-hidden="true">←</span>
            Lei Port Marketplace
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_18px_60px_rgba(54,65,48,0.08)]">
          <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <p className="text-xs font-semibold tracking-[0.3em] text-green-800 sm:text-sm">
                {theme.brand.eyebrow}
              </p>

              {shop.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={`${shop.shop_name} ロゴ`}
                  className="mt-8 h-36 w-36 object-contain sm:h-44 sm:w-44"
                />
              ) : (
                <div className="mt-8 flex h-36 w-36 items-center justify-center rounded-full bg-green-50 text-5xl sm:h-44 sm:w-44">
                  🌿
                </div>
              )}

              <h1 className="mt-8 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                {shop.shop_name}
              </h1>

              <p className="mt-7 text-xl font-medium leading-relaxed text-stone-800 sm:text-2xl">
                {theme.brand.catchCopy}
              </p>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
                {shop.description || theme.brand.subCopy}
              </p>
            </div>
          </div>
        </section>

        <section className="pb-14 pt-14 sm:pb-20 sm:pt-20">
          <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
                {theme.brand.collectionLabel}
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                {theme.brand.collectionTitle}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
                {theme.brand.collectionDescription}
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
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {items.map((item: any) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
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
