import Link from "next/link";
import { notFound } from "next/navigation";

import { requireShopAccess } from "@/lib/auth/shop-access";
import { isProductCategory, PRODUCT_CATEGORIES } from "@/lib/products/categories";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ProductImageField from "../ProductImageField";
import ProductSalesPeriodField from "@/components/product/ProductSalesPeriodField";
import ProductReservationPeriodField from "@/components/product/ProductReservationPeriodField";
import PickupCommentField from "@/components/product/PickupCommentField";
import { saveVendorProductDetails } from "../../actions";

export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const access = await requireShopAccess();
  const { id } = await params;
  const query = await searchParams;
  const { data: product } = await supabaseAdmin
    .from("exhibition_items")
    .select("id,item_no,product_name,category,tree_height,tree_shape,pot_size,irisu,quantity,price,pickup_comment,published,reservation_period_enabled,reservation_start_date,reservation_end_date,sales_period_enabled,sales_start_date,sales_end_date,exhibition_images(id,image_url,sort_order)")
    .eq("id", id)
    .eq("shop_id", access.shopId)
    .order("sort_order", { referencedTable: "exhibition_images", ascending: true })
    .maybeSingle();
  if (!product) notFound();
  const images = Array.isArray(product.exhibition_images) ? product.exhibition_images : [];
  const input = "mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm";
  return (
    <div>
      <Link href="/platform/shop/products" className="text-sm text-stone-500">← 商品一覧</Link>
      <div className="mt-4">
        <h1 className="text-3xl font-semibold">商品編集</h1>
        <p className="mt-2 text-sm text-stone-500">No.{product.item_no}　{product.published ? "公開中" : "下書き"}</p>
      </div>
      {query.error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{query.error}</p>}
      {query.saved && <p className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{query.saved === "published" ? "商品を公開しました。" : "下書きを保存しました。"}</p>}
      <form action={saveVendorProductDetails} className="mt-6 grid gap-5 rounded-2xl border bg-white p-5 sm:grid-cols-2 sm:p-6">
        <input type="hidden" name="productId" value={product.id} />
        <label className="text-sm">商品名<input name="productName" defaultValue={product.product_name ?? ""} className={input} /></label>
        <label className="text-sm">カテゴリー
          <select name="category" defaultValue={product.category ?? ""} className={input}>
            <option value="">選択してください</option>
            {product.category && !isProductCategory(product.category) && (
              <option value={product.category}>{product.category}（既存値）</option>
            )}
            {PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="text-sm">樹高<input name="treeHeight" defaultValue={product.tree_height ?? ""} className={input} /></label>
        <label className="text-sm">樹形<input name="treeShape" defaultValue={product.tree_shape ?? ""} className={input} /></label>
        <label className="text-sm">鉢サイズ<input name="potSize" defaultValue={product.pot_size ?? ""} className={input} /></label>
        <label className="text-sm">ケース入数<input name="irisu" type="number" min="1" step="1" defaultValue={product.irisu ?? 1} className={input} /></label>
        <label className="text-sm">販売可能ケース数<input name="quantity" type="number" min="0" step="1" defaultValue={product.quantity ?? 0} className={input} /></label>
        <label className="text-sm">税抜価格<input name="price" type="number" min="0" step="1" defaultValue={product.price ?? 0} className={input} /></label>
        <ProductImageField existingImageUrl={images[0]?.image_url ?? null} />
        <ProductReservationPeriodField defaultEnabled={product.reservation_period_enabled === true} defaultStartDate={product.reservation_start_date ?? ""} defaultEndDate={product.reservation_end_date ?? ""} />
        <ProductSalesPeriodField defaultEnabled={product.sales_period_enabled === true} defaultStartDate={product.sales_start_date ?? ""} defaultEndDate={product.sales_end_date ?? ""} />
        <div className="sm:col-span-2"><PickupCommentField defaultValue={product.pickup_comment ?? ""} /></div>
        <div className="flex flex-col gap-3 border-t pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
          <button name="intent" value="draft" className="rounded-xl border border-stone-400 bg-white px-6 py-3 text-sm font-medium">下書き保存</button>
          <button name="intent" value="publish" className="rounded-xl bg-green-800 px-6 py-3 text-sm font-medium text-white">公開する</button>
        </div>
        <p className="text-xs text-stone-500 sm:col-span-2">公開には商品名・カテゴリー・ケース入数・1円以上の価格が必要です。商品画像は任意です。</p>
      </form>
    </div>
  );
}
