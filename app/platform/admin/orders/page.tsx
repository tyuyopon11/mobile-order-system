import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { resolveOrderAmount } from "@/lib/orders/amounts";

type SearchParams = Promise<{
  orderNumber?: string;
  buyerNumber?: string;
  buyerName?: string;
  companyName?: string;
  auctionDate?: string;
}>;

type ItemRow = {
  item_no: number | null;
  product_name: string | null;
  price: number | null;
  shop_id: string | null;
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
  quantity: number | null;
  irisu: number;
  unit_price: number | null;
  total_amount: number | null;
  exhibition_items: ItemRow | ItemRow[] | null;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${year}/${month}/${day}` : value;
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function yen(value: number) {
  return `${value.toLocaleString("ja-JP")}円`;
}

export default async function ShopOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orderNumber = params.orderNumber?.trim() ?? "";
  const buyerNumber = params.buyerNumber?.trim() ?? "";
  const buyerName = params.buyerName?.trim() ?? "";
  const companyName = params.companyName?.trim() ?? "";
  const auctionDate = params.auctionDate?.trim() ?? "";

  const supabase = await createClient();
  let query = supabase
    .from("exhibition_orders")
    .select(`
      id,order_number,auction_date,ordered_at,buyer_no,branch_no,
      buyer_name,contact_name,quantity,irisu,unit_price,total_amount,
      exhibition_items(
        item_no,product_name,price,shop_id,
        shops(shop_name)
      )
    `)
    .eq("cancelled", false)
    .order("ordered_at", { ascending: false });

  if (orderNumber) query = query.ilike("order_number", `%${orderNumber}%`);
  if (buyerNumber) query = query.ilike("buyer_no", `%${buyerNumber}%`);
  if (buyerName) query = query.ilike("contact_name", `%${buyerName}%`);
  if (companyName) query = query.ilike("buyer_name", `%${companyName}%`);
  if (auctionDate) query = query.eq("auction_date", auctionDate);

  const { data, error } = await query;
  const orders = (data ?? []) as unknown as OrderRow[];
  const auctionDates = Array.from(
    new Set(orders.map((order) => order.auction_date).filter(Boolean) as string[])
  ).sort();

  return (
    <div>
      <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          ORDER MANAGEMENT
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              受注管理
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-500 sm:text-base">
              競り日ごとの注文確認と出荷用CSVの出力ができます。
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
            受付済 {orders.length}件
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input name="orderNumber" defaultValue={orderNumber} placeholder="注文番号" className="rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" />
          <input name="buyerNumber" defaultValue={buyerNumber} placeholder="買参番号" className="rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" />
          <input name="buyerName" defaultValue={buyerName} placeholder="買参人名" className="rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" />
          <input name="companyName" defaultValue={companyName} placeholder="会社名" className="rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" />
          <input name="auctionDate" type="date" defaultValue={auctionDate} aria-label="競り日" className="rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" />
          <div className="flex gap-2 md:col-span-2 xl:col-span-5">
            <button type="submit" className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700">
              検索
            </button>
            <Link href="/platform/admin/orders" className="rounded-xl border border-stone-300 px-5 py-3 text-sm text-stone-600 hover:bg-stone-50">
              クリア
            </Link>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-[24px] border border-green-100 bg-green-50/60 p-5 sm:p-6">
        <form action="/api/platform/admin/orders/export" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-2 block text-sm font-medium text-stone-700">競り日単位CSV</span>
            <input
              name="auction_date"
              type="date"
              required
              defaultValue={auctionDate || auctionDates.at(-1) || ""}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
            />
          </label>
          <button type="submit" className="rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white hover:bg-green-900">
            CSV出力
          </button>
        </form>
        <p className="mt-3 text-xs text-stone-500">
          選択した競り日の全注文明細を、Excel対応のCSVにまとめます。
        </p>
      </section>

      {error ? (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          注文情報を取得できませんでした：{error.message}
        </section>
      ) : (
        <section className="mt-6 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-stone-900">注文一覧</h2>
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-600">{orders.length}件</span>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-stone-500">
              条件に一致する注文はありません。
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1120px] text-left text-sm">
                  <thead className="border-b border-stone-100 bg-stone-50 text-xs text-stone-500">
                    <tr>
                      {["注文番号", "競り日", "注文日時", "買参番号", "買参人名", "会社名", "注文商品数", "注文金額（税抜）", "CSV"].map((label) => (
                        <th key={label} className="whitespace-nowrap px-5 py-4 font-semibold">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((order) => {
                      const item = one(order.exhibition_items);
                      const amount = resolveOrderAmount({ savedAmount: order.total_amount, savedUnitPrice: order.unit_price, currentProductPrice: item?.price, unitsPerSalesUnit: order.irisu, quantity: order.quantity });
                      return (
                        <tr key={order.id} className="hover:bg-stone-50">
                          <td className="px-5 py-5">
                            <Link href={`/platform/admin/orders/${order.id}`} className="font-semibold text-green-800 hover:underline">
                              {order.order_number ?? order.id}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-5 py-5">{formatDate(order.auction_date)}</td>
                          <td className="whitespace-nowrap px-5 py-5 text-stone-500">{formatDateTime(order.ordered_at)}</td>
                          <td className="whitespace-nowrap px-5 py-5">{order.buyer_no ?? "—"}{order.branch_no ? `-${order.branch_no}` : ""}</td>
                          <td className="px-5 py-5">{order.contact_name ?? "—"}</td>
                          <td className="px-5 py-5">{order.buyer_name ?? "—"}</td>
                          <td className="px-5 py-5">1商品</td>
                          <td className="whitespace-nowrap px-5 py-5 font-medium">{yen(amount)}</td>
                          <td className="px-5 py-5">
                            <a href={`/api/platform/admin/orders/export?order_number=${encodeURIComponent(order.order_number ?? String(order.id))}`} className="whitespace-nowrap rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50">
                              CSV出力
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-stone-100 lg:hidden">
                {orders.map((order) => {
                  const item = one(order.exhibition_items);
                  const amount = resolveOrderAmount({ savedAmount: order.total_amount, savedUnitPrice: order.unit_price, currentProductPrice: item?.price, unitsPerSalesUnit: order.irisu, quantity: order.quantity });
                  return (
                    <article key={order.id} className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/platform/admin/orders/${order.id}`} className="font-semibold text-green-800">
                            {order.order_number ?? order.id}
                          </Link>
                          <p className="mt-1 text-xs text-stone-400">{formatDateTime(order.ordered_at)}</p>
                        </div>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">受付済</span>
                      </div>
                      <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
                        <div><dt className="text-xs text-stone-400">競り日</dt><dd className="mt-1">{formatDate(order.auction_date)}</dd></div>
                        <div><dt className="text-xs text-stone-400">買参番号</dt><dd className="mt-1">{order.buyer_no ?? "—"}{order.branch_no ? `-${order.branch_no}` : ""}</dd></div>
                        <div><dt className="text-xs text-stone-400">買参人名</dt><dd className="mt-1">{order.contact_name ?? "—"}</dd></div>
                        <div><dt className="text-xs text-stone-400">会社名</dt><dd className="mt-1">{order.buyer_name ?? "—"}</dd></div>
                        <div><dt className="text-xs text-stone-400">注文商品数</dt><dd className="mt-1">1商品</dd></div>
                        <div><dt className="text-xs text-stone-400">注文金額（税抜）</dt><dd className="mt-1 font-semibold">{yen(amount)}</dd></div>
                      </dl>
                      <div className="mt-5 flex gap-2">
                        <Link href={`/platform/admin/orders/${order.id}`} className="flex-1 rounded-xl bg-green-800 px-4 py-3 text-center text-sm font-medium text-white">注文詳細</Link>
                        <a href={`/api/platform/admin/orders/export?order_number=${encodeURIComponent(order.order_number ?? String(order.id))}`} className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700">CSV出力</a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
