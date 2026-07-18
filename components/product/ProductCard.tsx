import Link from "next/link";

import type { Product } from "@/lib/types/product";

type ProductCardProps = {
  item: Pick<
    Product,
    | "id"
    | "name"
    | "image"
    | "quantity"
    | "comment"
  >;
};

export default function ProductCard({ item }: ProductCardProps) {
  const isSoldOut =
    item.quantity !== undefined &&
    item.quantity !== null &&
    item.quantity <= 0;

  const isOneOfAKind =
    item.quantity !== undefined &&
    item.quantity !== null &&
    item.quantity === 1;

  const attraction =
    item.comment?.trim() ||
    "樹形や葉の表情など、この植物ならではの魅力を詳細ページでご紹介します。";

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/platform/products/${item.id}`}
        aria-label={`${item.name}の詳細を見る`}
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-stone-200 bg-[#ecebe5] shadow-[0_14px_40px_rgba(54,65,48,0.08)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_22px_55px_rgba(54,65,48,0.14)]">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-stone-400">
              <span className="text-4xl">🌿</span>
              <span className="mt-3 text-xs tracking-widest">
                NO IMAGE
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-60" />

          {isOneOfAKind && !isSoldOut && (
            <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/85 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-stone-700 shadow-sm backdrop-blur">
              ONE OF A KIND
            </div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/45 backdrop-blur-[1px]">
              <span className="rounded-full border border-white/70 bg-white/90 px-6 py-3 text-sm font-semibold tracking-wider text-stone-800">
                売約済み
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-2 pt-6">
        <h3 className="line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-stone-900 sm:text-2xl">
          {item.name}
        </h3>

        <div className="mt-5">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-green-800">
            この植物の魅力
          </p>

          <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-500">
            {attraction}
          </p>
        </div>

        <div className="mt-auto pt-7">
          <Link
            href={`/platform/products/${item.id}`}
            className="inline-flex items-center gap-3 border-b border-stone-400 pb-1 text-sm font-medium text-stone-700 transition group-hover:border-green-800 group-hover:text-green-800"
          >
            詳細を見る
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}