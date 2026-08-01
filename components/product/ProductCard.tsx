import Link from "next/link";

import type { Product } from "@/lib/types/product";

type ProductCardProps = {
  item: Pick<
    Product,
    | "id"
    | "name"
    | "image"
    | "category"
    | "tree_height"
    | "tree_shape"
    | "pot_size"
    | "quantity"
    | "price"
    | "irisu"
  >;
};

export default function ProductCard({ item }: ProductCardProps) {
  const soldOut = item.quantity !== null && item.quantity <= 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-[0_10px_32px_rgba(54,65,48,0.06)]">
      <Link href={`/platform/products/${item.id}`} className="relative block aspect-[4/5] overflow-hidden bg-[#ecebe5]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#f4f5ef] to-[#e7ebe2] px-6 text-center">
            <span className="text-4xl text-green-800/70" aria-hidden="true">🌿</span>
            <span className="mt-4 text-sm font-medium text-stone-600">商品画像準備中</span>
            <span className="mt-1 text-xs text-stone-500">今後追加予定です</span>
            <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-green-800">
              Lei Port Marketplace
            </span>
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/45">
            <span className="rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-stone-800">
              売り切れ
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-green-800">{item.category || "カテゴリー未設定"}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-stone-900">{item.name}</h3>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div><dt className="text-stone-400">樹高</dt><dd className="font-medium text-stone-700">{item.tree_height || "—"}</dd></div>
          <div><dt className="text-stone-400">樹形</dt><dd className="font-medium text-stone-700">{item.tree_shape || "—"}</dd></div>
          <div><dt className="text-stone-400">鉢サイズ</dt><dd className="font-medium text-stone-700">{item.pot_size || "—"}</dd></div>
        </dl>

        <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-900">
          1ケース{item.irisu}鉢入り
        </p>

        <div className="mt-4 border-t border-stone-100 pt-4">
          <p className="text-xs text-stone-400">販売価格（税抜）</p>
          <p className="text-xl font-semibold text-stone-900">
            {item.price === null ? "価格未設定" : `¥${item.price.toLocaleString("ja-JP")}`}
            {item.price !== null && <span className="ml-1 text-xs font-normal text-stone-400">／ケース</span>}
          </p>
          {!soldOut && (
            <p className="mt-3 text-sm font-medium text-stone-700">
              販売可能 {item.quantity === null ? "未設定" : `${item.quantity}ケース`}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
