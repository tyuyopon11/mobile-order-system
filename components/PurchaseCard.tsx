import Link from "next/link";

type PurchaseCardProps = {
  productId: string;
  quantity?: number | null;
  shopSlug?: string;
  salesAvailable?: boolean;
  salesStatusLabel?: string;
};

export default function PurchaseCard({
  productId,
  quantity,
  shopSlug = "",
  salesAvailable = true,
  salesStatusLabel,
}: PurchaseCardProps) {
  const isSoldOut =
    quantity !== undefined &&
    quantity !== null &&
    quantity <= 0;
  const unavailable = isSoldOut || !salesAvailable;
  const isReservation = salesAvailable && salesStatusLabel === "予約受付中";

  const isTakashimaya =
    shopSlug.toLowerCase().includes("takashimaya");

  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(54,65,48,0.07)] sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
        ORDER
      </p>

      <h2 className="mt-3 text-xl font-semibold text-stone-900">
        {isSoldOut
          ? "こちらの植物は売約済みです"
          : !salesAvailable ? salesStatusLabel : isReservation ? "予約注文を受け付けています" : "ご購入について"}
      </h2>

      {!unavailable && (
        <p className="mt-3 text-sm leading-7 text-stone-500">
          {isTakashimaya
            ? "内容をご確認のうえ、購入手続きへお進みください。"
            : "数量と商品情報をご確認のうえ、購入手続きへお進みください。"}
        </p>
      )}

      {unavailable ? (
        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-full bg-stone-200 px-6 py-4 text-base font-semibold text-stone-500 sm:py-5 sm:text-lg"
        >
          {isSoldOut ? "売約済み" : salesStatusLabel ?? "現在は購入できません"}
        </button>
      ) : (
        <Link
          href={`/platform/order/${productId}`}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-green-800 px-6 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-green-900 hover:shadow-[0_14px_30px_rgba(22,101,52,0.22)] sm:py-5 sm:text-lg"
        >
          {isReservation ? "予約注文する" : "購入手続きへ"}
        </Link>
      )}

      {!unavailable && (
        <p className="mt-4 text-center text-xs leading-6 text-stone-400">
          ご注文後、担当者より詳細をご案内いたします。
        </p>
      )}
    </section>
  );
}
