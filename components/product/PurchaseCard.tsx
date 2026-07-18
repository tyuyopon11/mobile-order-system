import { getShopTheme } from "@/lib/shop-theme";

type PurchaseCardProps = {
  quantity?: number | null;
  shopSlug?: string;
  shopName?: string;
  shopType?: string | null;
};

export default function PurchaseCard({
  quantity,
  shopSlug = "",
  shopName = "",
  shopType = null,
}: PurchaseCardProps) {
  const isSoldOut =
    quantity !== undefined &&
    quantity !== null &&
    quantity <= 0;

  const theme = getShopTheme({
    slug: shopSlug,
    shop_name: shopName,
    type: shopType,
  });

  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_16px_45px_rgba(54,65,48,0.08)] sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
        {theme.purchase.eyebrow}
      </p>

      <h2 className="mt-3 text-xl font-semibold text-stone-900">
        {isSoldOut
          ? theme.purchase.soldOutTitle
          : theme.purchase.title}
      </h2>

      {!isSoldOut && (
        <p className="mt-3 text-sm leading-7 text-stone-500">
          {theme.purchase.description}
        </p>
      )}

      <button
        type="button"
        disabled={isSoldOut}
        className={`mt-6 w-full rounded-full px-6 py-4 text-base font-semibold transition duration-300 sm:py-5 sm:text-lg ${
          isSoldOut
            ? "cursor-not-allowed bg-stone-200 text-stone-500"
            : "bg-green-800 text-white shadow-sm hover:bg-green-900 hover:shadow-md"
        }`}
      >
        {isSoldOut
          ? theme.purchase.soldOutButtonLabel
          : theme.purchase.buttonLabel}
      </button>

      {!isSoldOut && (
        <p className="mt-4 text-center text-xs leading-6 text-stone-400">
          {theme.purchase.note}
        </p>
      )}
    </section>
  );
}
