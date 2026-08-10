import CancelOrderButton from "@/components/orders/CancelOrderButton";
import { requireShopAccess } from "@/lib/auth/shop-access";
import { getShopOrders } from "@/lib/orders/shop-orders";
import { cancelVendorOrder } from "./actions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; auctionDate?: string }>;
}) {
  const access = await requireShopAccess();
  const params = await searchParams;
  const orders = await getShopOrders(access.shopId, {
    search: params.q,
    auctionDate: params.auctionDate,
    orderBy: "newest",
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold">受注管理</h1>
      <form className="mt-6 grid gap-3 rounded-2xl border bg-white p-5 sm:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={params.q} placeholder="注文番号・買参番号・氏名・会社名" className="rounded-xl border px-4 py-3 text-sm" />
        <input name="auctionDate" type="date" defaultValue={params.auctionDate} className="rounded-xl border px-4 py-3 text-sm" />
        <button className="rounded-xl bg-stone-900 px-5 py-3 text-sm text-white">検索</button>
      </form>
      <form action="/api/platform/shop/orders/export" method="get" className="mt-4 flex gap-3 rounded-2xl bg-green-50 p-4">
        <input name="auction_date" type="date" required className="rounded-xl border px-4 py-3 text-sm" />
        <button className="rounded-xl bg-green-800 px-5 py-3 text-sm text-white">競り日CSV</button>
      </form>
      <section className="mt-6 divide-y overflow-hidden rounded-2xl border bg-white">
        {orders.map((order) => {
          const orderNumber = order.order_number || String(order.id);
          return (
            <article key={order.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-semibold">{orderNumber}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {order.buyer_no}{order.branch_no ? `-${order.branch_no}` : ""}・{order.contact_name || "－"}・{order.buyer_name || "－"}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  {order.item.product_name} / {order.quantity}ケース / {Number(order.quantity) * Number(order.irisu)}鉢
                </p>
                <p className="mt-2 text-sm">競り日 {order.auction_date || "未設定"}</p>
              </div>
              <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                <a href={`/api/platform/shop/orders/export?order_number=${encodeURIComponent(orderNumber)}`} className="rounded-lg border px-3 py-2 text-center text-xs">CSV出力</a>
                <CancelOrderButton orderId={String(order.id)} orderNumber={orderNumber} action={cancelVendorOrder} />
              </div>
            </article>
          );
        })}
        {!orders.length ? <p className="p-10 text-center text-sm text-stone-500">注文はありません。</p> : null}
      </section>
    </div>
  );
}
