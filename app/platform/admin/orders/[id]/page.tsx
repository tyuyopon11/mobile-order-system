import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { calculateTotalUnits, resolveOrderAmount, resolveOrderUnitPrice } from "@/lib/orders/amounts";
import CancelOrderButton from "@/components/orders/CancelOrderButton";
import { cancelOrder } from "./actions";

type ItemRow = {
  item_no: number | null;
  product_name: string | null;
  price: number | null;
  shops: { shop_name: string | null } | { shop_name: string | null }[] | null;
};

type OrderRow = {
  id: number;
  order_number: string | null;
  auction_date: string | null;
  ordered_at: string | null;
  buyer_no: string | null;
  branch_no: string | null;
  buyer_name: string | null;
  contact_name: string | null;
  contact_tel: string | null;
  note: string | null;
  quantity: number | null;
  irisu: number;
  total_units: number | null;
  unit_price: number | null;
  total_amount: number | null;
  status: string | null;
  cancelled: boolean | null;
  exhibition_items: ItemRow | ItemRow[] | null;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return value.replaceAll("-", "/");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

function yen(value: number) {
  return `${value.toLocaleString("ja-JP")}円`;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-stone-400">{label}</dt>
      <dd className="mt-1.5 font-medium text-stone-800">{value}</dd>
    </div>
  );
}

export default async function ShopOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibition_orders")
    .select(`
      id,order_number,auction_date,ordered_at,buyer_no,branch_no,
      buyer_name,contact_name,contact_tel,note,quantity,irisu,total_units,unit_price,total_amount,status,cancelled,
      exhibition_items(item_no,product_name,price,shops(shop_name))
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const order = data as unknown as OrderRow;
  const item = one(order.exhibition_items);
  const cases = Number(order.quantity ?? 0);
  const irisu = Number(order.irisu ?? 1);
  const totalPots = calculateTotalUnits(irisu, cases);
  const unitPrice = resolveOrderUnitPrice(order.unit_price, item?.price);
  const amount = resolveOrderAmount({ savedAmount: order.total_amount, savedUnitPrice: order.unit_price, currentProductPrice: item?.price, unitsPerSalesUnit: irisu, quantity: cases });
  const isCancelled = order.cancelled === true || order.status === "cancelled";

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-green-800">ORDER DETAIL</p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">注文詳細</h1>
          <p className="mt-3 text-sm text-stone-500">{order.order_number ?? order.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CancelOrderButton
            orderId={String(order.id)}
            orderNumber={order.order_number ?? String(order.id)}
            isCancelled={isCancelled}
            action={cancelOrder}
          />
          <a href={`/api/platform/admin/orders/export?order_number=${encodeURIComponent(order.order_number ?? String(order.id))}`} className="rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white hover:bg-green-900">
            CSV出力
          </a>
          <Link href="/platform/admin/orders" className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50">
            ← 受注一覧
          </Link>
        </div>
      </div>

      <section className="mt-7 rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <h2 className="text-xl font-semibold text-stone-900">注文情報</h2>
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${isCancelled ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>
            {isCancelled ? "キャンセル済み" : "受付済み"}
          </span>
        </div>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="注文番号" value={order.order_number ?? String(order.id)} />
          <Detail label="競り日" value={formatDate(order.auction_date)} />
          <Detail label="注文日時" value={formatDateTime(order.ordered_at)} />
          <Detail label="買参番号" value={order.buyer_no ?? "—"} />
          <Detail label="枝番" value={order.branch_no ?? "—"} />
          <Detail label="買参人名" value={order.contact_name ?? "—"} />
          <Detail label="会社名" value={order.buyer_name ?? "—"} />
          <Detail label="電話番号" value={order.contact_tel ?? "—"} />
        </dl>
        <div className="mt-7 rounded-2xl bg-stone-50 p-5">
          <p className="text-xs text-stone-400">コメント</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">{order.note?.trim() || "コメントはありません。"}</p>
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
          <h2 className="text-xl font-semibold text-stone-900">注文明細</h2>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 text-xs text-stone-500">
              <tr>
                {["商品番号", "商品名", "ケース数", "入数", "総鉢数", "単価", "金額"].map((label) => (
                  <th key={label} className="whitespace-nowrap px-5 py-4 font-semibold">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-5 py-5">{item?.item_no ?? "—"}</td>
                <td className="px-5 py-5 font-medium text-stone-900">{item?.product_name ?? "—"}</td>
                <td className="px-5 py-5">{cases}ケース</td>
                <td className="px-5 py-5">{irisu}鉢</td>
                <td className="px-5 py-5 font-semibold text-green-800">{totalPots}鉢</td>
                <td className="px-5 py-5">{yen(unitPrice)}</td>
                <td className="px-5 py-5 font-semibold">{yen(amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-5 p-6 text-sm md:hidden">
          <Detail label="商品番号" value={String(item?.item_no ?? "—")} />
          <Detail label="商品名" value={item?.product_name ?? "—"} />
          <Detail label="ケース数" value={`${cases}ケース`} />
          <Detail label="入数" value={`${irisu}鉢`} />
          <Detail label="総鉢数" value={`${totalPots}鉢`} />
          <Detail label="単価" value={yen(unitPrice)} />
          <Detail label="金額" value={yen(amount)} />
        </dl>
        <div className="border-t border-stone-100 bg-stone-50 px-6 py-5 text-right sm:px-8">
          <p className="text-sm text-stone-500">注文金額（税抜）</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{yen(amount)}</p>
        </div>
      </section>
    </div>
  );
}
