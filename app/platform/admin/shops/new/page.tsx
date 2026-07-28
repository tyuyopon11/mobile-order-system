import Link from "next/link";

import ShopForm from "./ShopForm";

export default function NewShopPage() {
  return (
    <div>
      <Link
        href="/platform/admin/shops"
        className="inline-flex text-sm font-medium text-stone-500 transition hover:text-green-800"
      >
        ← ショップ一覧へ戻る
      </Link>

      <section className="mt-4 rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          NEW SHOP
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          新規ショップ登録
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
          Lei Portに追加するショップの基本情報を登録します。ロゴとバナー画像は、登録後の画像管理で設定できます。
        </p>
      </section>

      <section className="mt-6 rounded-[24px] border border-stone-200 bg-white px-6 py-7 shadow-sm sm:px-9 sm:py-9">
        <ShopForm />
      </section>
    </div>
  );
}
