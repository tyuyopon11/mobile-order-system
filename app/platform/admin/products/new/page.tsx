import Link from "next/link";

import { getShops } from "@/lib/services/shop";

import ProductForm from "./ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const shops = await getShops();

  return (
    <div>
      <Link
        href="/platform/admin/products"
        className="inline-flex text-sm font-medium text-stone-500 transition hover:text-green-800"
      >
        ← 商品一覧へ戻る
      </Link>

      <section className="mt-4 rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          NEW PRODUCT
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          新規商品登録
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
          ショップへ追加する商品の基本情報と販売状態を登録します。商品画像は登録後の編集画面で設定できます。
        </p>
      </section>

      <section className="mt-6 rounded-[24px] border border-stone-200 bg-white px-6 py-7 shadow-sm sm:px-9 sm:py-9">
        <ProductForm
          shops={shops.map((shop) => ({
            id: shop.id,
            shop_name: shop.shop_name,
          }))}
        />
      </section>
    </div>
  );
}
