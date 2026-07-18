import Link from "next/link";

type ShopCardProps = {
  shop: {
    shop_name: string;
    slug: string;
  };
};

function isTakashimayaShop(shopName: string, slug: string) {
  const normalizedName = shopName.toLowerCase();
  const normalizedSlug = slug.toLowerCase();

  return (
    normalizedName.includes("高島屋") ||
    normalizedSlug.includes("takashimaya")
  );
}

export default function ShopCard({ shop }: ShopCardProps) {
  const isTakashimaya = isTakashimayaShop(
    shop.shop_name,
    shop.slug
  );

  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_12px_35px_rgba(54,65,48,0.05)] sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
        SHOP
      </p>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
        {shop.shop_name}
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-7 text-stone-500">
        {isTakashimaya
          ? "目利きのプロが樹形や葉の表情を見極め、ここにしかない一鉢を選んでいます。"
          : "東京フラワーポートが取り扱う植物を、商品情報とともにご案内しています。"}
      </p>

      <Link
        href={`/platform/shops/${shop.slug}`}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-green-800 hover:bg-green-50 hover:text-green-800"
      >
        ショップを見る
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}