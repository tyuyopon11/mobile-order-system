import Link from "next/link";

import { requireShopAccess } from "@/lib/auth/shop-access";
import { canPublishProduct } from "@/lib/products/publication";
import { formatProductSalesPeriod, getProductSalesPeriodStatus, getProductSalesStatusLabel } from "@/lib/products/sales-period";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logMission25Perf, startMission25Perf } from "@/lib/performance/mission25-perf";
import { setVendorProductPublished } from "../actions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string; created?: string }>;
}) {
  const totalStartedAt = startMission25Perf();
  const access = await requireShopAccess();
  const query = await searchParams;
  const productsStartedAt = startMission25Perf();
  const { data } = await supabaseAdmin
    .from("exhibition_items")
    .select("id,item_no,product_name,category,quantity,irisu,price,status,published,sales_period_enabled,sales_start_date,sales_end_date")
    .eq("shop_id", access.shopId)
    .order("created_at", { ascending: false });
  logMission25Perf("page.products.db", productsStartedAt);

  const success = query.created
    ? "商品を登録しました。"
    : query.updated === "published"
      ? "商品を公開しました。"
      : query.updated === "unpublished"
        ? "商品を非公開にしました。"
        : null;
  logMission25Perf("page.products.total", totalStartedAt);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">商品管理</h1>
          <p className="mt-2 text-sm text-stone-500">{access.shopName}の商品だけを表示しています。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/platform/shop/products/new" className="rounded-xl bg-green-800 px-4 py-3 text-sm font-medium text-white">＋ 新規商品登録</Link>
          <Link href="/admin/exhibition/import" className="rounded-xl border border-green-800 bg-white px-4 py-3 text-sm font-medium text-green-800">Excel取込</Link>
        </div>
      </div>

      {query.error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{query.error}</p>}
      {success && <p className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status">{success}</p>}

      <section className="mt-6 divide-y overflow-hidden rounded-2xl border bg-white">
        {(data ?? []).map((product) => {
          const ready = canPublishProduct({
            name: product.product_name,
            category: product.category,
            irisu: Number(product.irisu),
            price: Number(product.price),
          });
          const salesPeriod = formatProductSalesPeriod(product);
          const salesStatus = getProductSalesPeriodStatus(product);
          return (
            <article key={product.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{product.product_name || "商品名未入力"}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${product.published ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-600"}`}>{product.published ? "公開中" : "下書き"}</span>
                  {!ready && !product.published && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">公開準備中</span>}
                  {salesPeriod && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800">{getProductSalesStatusLabel(salesStatus)}・{salesPeriod}</span>}
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-500">No.{product.item_no}・1ケース{product.irisu}鉢入り・{Number(product.price ?? 0).toLocaleString()}円・販売可能 {product.quantity ?? 0}ケース</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Link href={`/platform/shop/products/${product.id}`} className="rounded-xl border border-stone-300 px-5 py-2.5 text-center text-sm font-medium text-stone-700 hover:bg-stone-50">編集</Link>
                <form action={setVendorProductPublished}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="publish" value={product.published ? "false" : "true"} />
                  <button className={`w-full rounded-xl px-5 py-2.5 text-sm font-medium ${product.published ? "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50" : "bg-green-800 text-white hover:bg-green-900"}`}>{product.published ? "非公開にする" : "公開する"}</button>
                </form>
              </div>
            </article>
          );
        })}
        {!data?.length && <p className="p-10 text-center text-sm text-stone-500">商品はありません。</p>}
      </section>
    </div>
  );
}
