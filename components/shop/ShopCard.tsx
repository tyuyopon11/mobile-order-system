import Link from "next/link";

import { getShopTheme } from "@/lib/shop-theme";

type ShopCardProps = {
  shop: {
    shop_name: string;
    slug: string;
    type?: string | null;
  };
};

export default function ShopCard({
  shop,
}: ShopCardProps) {
  const theme = getShopTheme(shop);

  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_12px_35px_rgba(54,65,48,0.05)] sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
        {theme.shopCard.eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
        {shop.shop_name}
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-7 text-stone-500">
        {theme.shopCard.description}
      </p>

      <Link
        href={`/platform/shops/${shop.slug}`}
        className="mt-6 inline-flex items-center gap-3 border-b border-stone-400 pb-1 text-sm font-medium text-stone-700 transition hover:border-green-800 hover:text-green-800"
      >
        {theme.shopCard.linkLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
