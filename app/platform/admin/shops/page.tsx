import Image from "next/image";
import Link from "next/link";

import { getShops, type Shop, type ShopType } from "@/lib/services/shop";

import ShopToggleButton from "./ShopToggleButton";
import { openAdminShop } from "@/app/platform/shop/actions";

export const dynamic = "force-dynamic";

const SHOP_TYPE_LABELS: Record<ShopType, string> = {
  market: "市場",
  plant_shop: "園芸店",
  producer: "生産者",
  vendor: "仲卸・卸売",
  corporate: "法人",
  brand: "ブランド",
  exhibition: "展示販売",
  official: "CIRQNEX公式",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getShopTypeLabel(type: ShopType | null) {
  return type ? SHOP_TYPE_LABELS[type] : "未設定";
}

export default async function AdminShopsPage() {
  let shops: Shop[] = [];
  let loadError = "";

  try {
    shops = await getShops();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "ショップ情報を取得できませんでした。";
    console.error("[Lei Port Admin] Failed to load shops:", error);
  }

  const publishedCount = shops.filter((shop) => shop.published).length;
  const featuredCount = shops.filter((shop) => shop.is_featured).length;

  return (
    <div>
      <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          SHOP MANAGEMENT
        </p>

        <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              ショップ管理
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
              CIRQNEXに出店するショップの情報、公開状態、おすすめ表示を管理します。
            </p>
          </div>

          <Link
            href="/platform/admin/shops/new"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-900"
          >
            <span aria-hidden="true" className="mr-2">
              ＋
            </span>
            新規ショップ登録
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs text-stone-500">全ショップ</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {shops.length}
            <span className="ml-1 text-xs font-normal text-stone-500">件</span>
          </p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50/60 px-5 py-4">
          <p className="text-xs text-green-800">公開中</p>
          <p className="mt-2 text-2xl font-semibold text-green-900">
            {publishedCount}
            <span className="ml-1 text-xs font-normal">件</span>
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-4">
          <p className="text-xs text-amber-800">おすすめ</p>
          <p className="mt-2 text-2xl font-semibold text-amber-900">
            {featuredCount}
            <span className="ml-1 text-xs font-normal">件</span>
          </p>
        </div>
      </section>

      {loadError && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-800">
            ショップ情報を取得できませんでした。
          </p>
          <p className="mt-1 text-xs text-red-600">{loadError}</p>
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-green-800">
              ALL SHOPS
            </p>
            <h2 className="mt-1 text-xl font-semibold text-stone-900">
              ショップ一覧
            </h2>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
            {shops.length}件
          </span>
        </div>

        {!loadError && shops.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-stone-700">
              ショップはまだ登録されていません。
            </p>
            <Link
              href="/platform/admin/shops/new"
              className="mt-4 inline-flex text-sm font-medium text-green-800 hover:text-green-900"
            >
              最初のショップを登録する →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {shops.map((shop) => (
              <article key={shop.id} className="px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 gap-4 sm:gap-5">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 sm:h-20 sm:w-20">
                      {shop.logo_url ? (
                        <Image
                          src={shop.logo_url}
                          alt={`${shop.shop_name}のロゴ`}
                          fill
                          sizes="80px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <span className="text-xl font-semibold text-green-800">
                          {shop.shop_name.slice(0, 1)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold text-stone-900">
                          {shop.shop_name}
                        </h3>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {getShopTypeLabel(shop.shop_type)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-stone-500">
                        /platform/shops/{shop.slug}
                      </p>

                      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                        <div>
                          <dt className="inline text-stone-400">商品数 </dt>
                          <dd className="inline font-medium text-stone-600">
                            未連携
                          </dd>
                        </div>
                        <div>
                          <dt className="inline text-stone-400">表示順 </dt>
                          <dd className="inline font-medium text-stone-600">
                            {shop.display_order}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline text-stone-400">登録 </dt>
                          <dd className="inline font-medium text-stone-600">
                            {formatDate(shop.created_at)}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline text-stone-400">更新 </dt>
                          <dd className="inline font-medium text-stone-600">
                            {formatDate(shop.updated_at)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-start gap-2 sm:pl-20 xl:pl-0">
                    <form action={openAdminShop}>
                      <input type="hidden" name="shopId" value={shop.id} />
                      <button className="rounded-xl bg-green-800 px-4 py-2 text-xs font-medium text-white hover:bg-green-900">
                        ショップ管理画面を開く
                      </button>
                    </form>
                    <ShopToggleButton
                      shopId={shop.id}
                      field="published"
                      value={shop.published}
                    />
                    <ShopToggleButton
                      shopId={shop.id}
                      field="is_featured"
                      value={shop.is_featured}
                    />
                    <Link
                      href={`/platform/admin/shops/${shop.id}`}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-900"
                    >
                      編集
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
