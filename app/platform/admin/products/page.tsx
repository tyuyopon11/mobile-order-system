import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import {
  formatSalesUnitQuantity,
  formatUnitsPerSalesUnit,
} from "@/lib/products/sales-unit";
import { formatProductSalesPeriod, getProductSalesPeriodStatus, getProductSalesStatusLabel } from "@/lib/products/sales-period";

import ProductQuickActions from "./ProductQuickActions";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    shop?: string;
    status?: string;
    visibility?: string;
  }>;
};

type ShopOption = {
  id: string;
  shop_name: string;
};

type ProductImage = {
  image_url: string;
  sort_order: number | null;
};

type ProductRow = {
  id: number;
  item_no: number;
  product_name: string | null;
  category: string | null;
  item: string | null;
  variety: string | null;
  quantity: number | null;
  price: number | null;
  irisu: number;
  sales_unit: string;
  units_per_sales_unit: number;
  status: "preparing" | "selling" | "sold";
  published: boolean;
  is_featured: boolean;
  sales_period_enabled: boolean;
  sales_start_date: string | null;
  sales_end_date: string | null;
  display_order: number;
  updated_at: string;
  shops: { shop_name: string; slug: string } | null;
  exhibition_images: ProductImage[];
};

const PAGE_SIZE = 30;

const STATUS_LABELS: Record<string, string> = {
  preparing: "準備中",
  selling: "販売中",
  sold: "売約済み",
};

const STATUS_CLASSES: Record<string, string> = {
  preparing: "bg-amber-50 text-amber-700",
  selling: "bg-green-100 text-green-800",
  sold: "bg-stone-100 text-stone-600",
};

function firstValue(value: string | undefined) {
  return value?.trim() ?? "";
}

function formatPrice(value: number | null) {
  if (value === null) return "価格未設定";
  return `${new Intl.NumberFormat("ja-JP").format(value)}円`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function createProductsUrl(
  current: {
    q: string;
    shop: string;
    status: string;
    visibility: string;
  },
  page: number
) {
  const params = new URLSearchParams();
  if (current.q) params.set("q", current.q);
  if (current.shop) params.set("shop", current.shop);
  if (current.status) params.set("status", current.status);
  if (current.visibility) params.set("visibility", current.visibility);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/platform/admin/products${query ? `?${query}` : ""}`;
}

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const q = firstValue(params.q);
  const shop = firstValue(params.shop);
  const status = firstValue(params.status);
  const visibility = firstValue(params.visibility);
  const parsedPage = Number(params.page ?? "1");
  const page =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createClient();

  const [
    shopsResult,
    totalResult,
    publishedResult,
    sellingResult,
    soldResult,
  ] = await Promise.all([
    supabase
      .from("shops")
      .select("id,shop_name")
      .order("display_order", { ascending: true }),
    supabase
      .from("exhibition_items")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("exhibition_items")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase
      .from("exhibition_items")
      .select("id", { count: "exact", head: true })
      .eq("status", "selling"),
    supabase
      .from("exhibition_items")
      .select("id", { count: "exact", head: true })
      .eq("status", "sold"),
  ]);

  let productsQuery = supabase
    .from("exhibition_items")
    .select(
      `
        id,
        item_no,
        product_name,
        category,
        item,
        variety,
        quantity,
        price,
        irisu,
        sales_unit,
        units_per_sales_unit,
        status,
        published,
        is_featured,
        sales_period_enabled,
        sales_start_date,
        sales_end_date,
        display_order,
        updated_at,
        shops (
          shop_name,
          slug
        ),
        exhibition_images (
          image_url,
          sort_order
        )
      `,
      { count: "exact" }
    );

  if (q) {
    const safeQuery = q.replace(/[%_,()]/g, " ").trim();
    if (safeQuery) {
      productsQuery = productsQuery.or(
        `product_name.ilike.%${safeQuery}%,variety.ilike.%${safeQuery}%,item.ilike.%${safeQuery}%,jf_code.ilike.%${safeQuery}%`
      );
    }
  }

  if (shop) productsQuery = productsQuery.eq("shop_id", shop);
  if (status && STATUS_LABELS[status]) {
    productsQuery = productsQuery.eq("status", status);
  }
  if (visibility === "published") {
    productsQuery = productsQuery.eq("published", true);
  } else if (visibility === "private") {
    productsQuery = productsQuery.eq("published", false);
  }

  const { data, error, count } = await productsQuery
    .order("display_order", { ascending: true })
    .order("item_no", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("[Lei Port Admin] Failed to load products:", error.message);
  }

  const products = (data ?? []) as unknown as ProductRow[];
  const shops = (shopsResult.data ?? []) as unknown as ShopOption[];
  const resultCount = count ?? 0;
  const totalPages = Math.max(Math.ceil(resultCount / PAGE_SIZE), 1);
  const activeFilters = { q, shop, status, visibility };

  return (
    <div>
      <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          PRODUCT MANAGEMENT
        </p>
        <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              商品管理
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
              ショップごとの商品情報、販売状態、Marketplaceへの公開状態を管理します。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/platform/admin/products/new"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-900"
            >
              ＋ 新規商品登録
            </Link>
            <Link
              href="/admin/exhibition/import"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-green-800 bg-white px-5 py-3 text-sm font-medium text-green-800 transition hover:bg-green-50"
            >
              📄 Excel取込
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["全商品", totalResult.count ?? 0, "text-stone-900"],
          ["公開中", publishedResult.count ?? 0, "text-green-900"],
          ["販売中", sellingResult.count ?? 0, "text-blue-900"],
          ["売約済み", soldResult.count ?? 0, "text-stone-700"],
        ].map(([label, value, color]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-xs text-stone-500">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${color}`}>
              {value}
              <span className="ml-1 text-xs font-normal">件</span>
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_220px_160px_160px_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="商品名・品種・品目・JFコード"
            className="rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
          <select
            name="shop"
            defaultValue={shop}
            className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">すべてのショップ</option>
            {shops.map((option) => (
              <option key={option.id} value={option.id}>
                {option.shop_name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">すべての状態</option>
            <option value="preparing">準備中</option>
            <option value="selling">販売中</option>
            <option value="sold">売約済み</option>
          </select>
          <select
            name="visibility"
            defaultValue={visibility}
            className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">公開・非公開</option>
            <option value="published">公開中</option>
            <option value="private">非公開</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              検索
            </button>
            <Link
              href="/platform/admin/products"
              className="rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-600 hover:bg-stone-50"
            >
              解除
            </Link>
          </div>
        </form>
      </section>

      {error && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          商品情報を取得できませんでした：{error.message}
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-green-800">
              ALL PRODUCTS
            </p>
            <h2 className="mt-1 text-xl font-semibold">商品一覧</h2>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-600">
            {resultCount}件
          </span>
        </div>

        {!error && products.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-stone-500">
            条件に一致する商品はありません。
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {products.map((product) => {
              const image = [...(product.exhibition_images ?? [])].sort(
                (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
              )[0]?.image_url;

              return (
                <article key={product.id} className="px-6 py-5 sm:px-8">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                        {image ? (
                          <Image
                            src={image}
                            alt={product.product_name ?? "商品画像"}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl">
                            🌿
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-stone-900">
                            {product.product_name ?? "商品名未設定"}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              STATUS_CLASSES[product.status] ??
                              "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {STATUS_LABELS[product.status] ?? product.status}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              product.published
                                ? "bg-green-50 text-green-800"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {product.published ? "公開" : "非公開"}
                          </span>
                          {product.is_featured && (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                              おすすめ
                            </span>
                          )}
                          {formatProductSalesPeriod(product) && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                              {getProductSalesStatusLabel(getProductSalesPeriodStatus(product))}・{formatProductSalesPeriod(product)}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-stone-500">
                          {product.shops?.shop_name ?? "ショップ未設定"} ／ 商品番号{" "}
                          {product.item_no}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-500">
                          <span>
                            {[product.category, product.item, product.variety]
                              .filter(Boolean)
                              .join(" / ") || "分類未設定"}
                          </span>
                          <span>
                            販売可能{" "}
                            {product.quantity === null
                              ? "未設定"
                              : formatSalesUnitQuantity(
                                  product.quantity,
                                  product.sales_unit
                                )}
                          </span>
                          <span>
                            {formatUnitsPerSalesUnit(
                              product.irisu ?? product.units_per_sales_unit,
                              "case"
                            )}
                          </span>
                          <span>
                            {formatPrice(product.price)}（税抜）／販売単位
                          </span>
                          <span>更新 {formatDate(product.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:pl-24 xl:items-end xl:pl-0">
                      <ProductQuickActions
                        productId={product.id}
                        published={product.published}
                        isFeatured={product.is_featured}
                        status={product.status}
                      />
                      <div className="flex gap-2">
                      {product.published ? (
                        <Link
                          href={`/platform/products/${product.id}`}
                          className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
                        >
                          表示確認
                        </Link>
                      ) : (
                        <span
                          title="非公開商品のため表示確認できません"
                          className="cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-stone-400"
                        >
                          非公開
                        </span>
                      )}
                      <Link
                        href={`/platform/admin/products/${product.id}`}
                        className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-medium text-green-800 hover:bg-green-100"
                      >
                        編集
                      </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-3 border-t border-stone-100 px-6 py-5">
            {page > 1 ? (
              <Link
                href={createProductsUrl(activeFilters, page - 1)}
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50"
              >
                ← 前へ
              </Link>
            ) : (
              <span className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-stone-300">
                ← 前へ
              </span>
            )}
            <span className="text-sm text-stone-500">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={createProductsUrl(activeFilters, page + 1)}
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50"
              >
                次へ →
              </Link>
            ) : (
              <span className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-stone-300">
                次へ →
              </span>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
