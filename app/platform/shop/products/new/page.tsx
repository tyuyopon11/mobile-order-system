import Link from "next/link";

import ProductImageField from "../ProductImageField";
import { createVendorProduct } from "../../actions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const input = "mt-2 w-full rounded-xl border border-stone-300 px-4 py-3";
  return (
    <div>
      <Link href="/platform/shop/products" className="text-sm text-stone-500">← 商品一覧</Link>
      <h1 className="mt-4 text-3xl font-semibold">新規商品登録</h1>
      {query.error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{query.error}</p>}
      <form action={createVendorProduct} className="mt-6 grid gap-5 rounded-2xl border bg-white p-5 sm:grid-cols-2 sm:p-6">
        <label className="text-sm">商品名<input name="productName" className={input} /></label>
        <label className="text-sm">カテゴリー<input name="category" className={input} /></label>
        <label className="text-sm">樹高<input name="treeHeight" className={input} /></label>
        <label className="text-sm">樹形<input name="treeShape" className={input} /></label>
        <label className="text-sm">鉢サイズ<input name="potSize" className={input} /></label>
        <label className="text-sm">ケース入数<input name="irisu" type="number" min="1" step="1" defaultValue="1" className={input} /></label>
        <label className="text-sm">販売可能ケース数<input name="quantity" type="number" min="0" step="1" defaultValue="0" className={input} /></label>
        <label className="text-sm">税抜価格<input name="price" type="number" min="0" step="1" defaultValue="0" className={input} /></label>
        <ProductImageField />
        <div className="flex flex-col gap-3 border-t pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
          <button name="intent" value="draft" className="rounded-xl border border-stone-400 bg-white px-6 py-3 text-sm font-medium">下書き保存</button>
          <button name="intent" value="publish" className="rounded-xl bg-green-800 px-6 py-3 text-sm font-medium text-white">公開する</button>
        </div>
        <p className="text-xs text-stone-500 sm:col-span-2">公開には商品名・カテゴリー・ケース入数・1円以上の価格が必要です。商品画像は任意です。</p>
      </form>
    </div>
  );
}
