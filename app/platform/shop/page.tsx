import { requireShopAccess } from "@/lib/auth/shop-access";
import { resolveOrderAmount } from "@/lib/orders/amounts";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function Page() {
  const access = await requireShopAccess();
  const today = new Date().toISOString().slice(0, 10);
  const week = new Date(Date.now() - 6 * 86400000).toISOString();
  const { data: items } = await supabaseAdmin
    .from("exhibition_items")
    .select("price,exhibition_orders(id,quantity,irisu,unit_price,total_amount,ordered_at,cancelled)")
    .eq("shop_id", access.shopId);
  const orders = (items ?? [])
    .flatMap((item: any) =>
      (item.exhibition_orders ?? []).map((order: any) => ({
        ...order,
        currentPrice: Number(item.price ?? 0),
      }))
    )
    .filter((order: any) => !order.cancelled);
  const { data: shop } = await supabaseAdmin
    .from("shops")
    .select("announcement")
    .eq("id", access.shopId)
    .single();
  const weeklySales = orders
    .filter((order: any) => order.ordered_at >= week)
    .reduce(
      (sum: number, order: any) =>
        sum + resolveOrderAmount({
          savedAmount: order.total_amount,
          savedUnitPrice: order.unit_price,
          currentProductPrice: order.currentPrice,
          unitsPerSalesUnit: order.irisu,
          quantity: order.quantity,
        }),
      0
    );
  const cards = [
    ["本日の受注件数", `${orders.filter((order: any) => String(order.ordered_at).slice(0, 10) === today).length}件`],
    ["今週売上", `${weeklySales.toLocaleString()}円`],
    ["未処理注文", `${orders.length}件`],
  ];
  return (
    <div>
      <h1 className="text-3xl font-semibold">ダッシュボード</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <section className="mt-6 rounded-2xl border bg-white p-6">
        <h2 className="font-semibold">ショップからのお知らせ</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
          {shop?.announcement || "お知らせはありません。"}
        </p>
      </section>
    </div>
  );
}
