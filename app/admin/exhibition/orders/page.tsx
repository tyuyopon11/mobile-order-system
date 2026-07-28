import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type GroupedOrder = {
  buyerKey: string;
  buyer_no: string;
  branch: string;
  buyer_name: string;
  contact: string;
  orders: any[];
  totalAmount: number;
  inputCompletedCount: number;
  notCompletedCount: number;
};

export default async function ExhibitionOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("exhibition_orders")
    .select(`
      id,
      item_id,
      buyer_no,
      branch,
      buyer_name,
      contact,
      quantity,
      status,
      ordered_at,
      exhibition_items (
        id,
        item_no,
        product_name,
        spec,
        price,
        staff,
        input_completed
      )
    `)
    .eq("status", "secured")
    .order("buyer_no", { ascending: true })
    .order("branch", { ascending: true })
    .order("ordered_at", { ascending: true });

  if (error) {
    return (
      <main className="p-6">
        <Link href="/admin/exhibition" className="inline-block rounded border px-4 py-2 text-sm">
          ← 管理画面へ戻る
        </Link>

        <div className="mt-6 rounded-lg bg-red-50 p-4 font-bold text-red-600">
          売約一覧の取得に失敗しました。
        </div>

        <pre className="mt-4 text-xs">{error.message}</pre>
      </main>
    );
  }

  const orderList = orders ?? [];

  const groupedMap = new Map<string, GroupedOrder>();

  for (const order of orderList as any[]) {
    const buyerNo = order.buyer_no ?? "";
    const branch = order.branch ?? "";
    const buyerName = order.buyer_name ?? "";
    const contact = order.contact ?? "";
    const buyerKey = `${buyerNo}-${branch}-${buyerName}`;

    const item = order.exhibition_items;
    const price = Number(item?.price ?? 0);
    const quantity = Number(order.quantity ?? 1);
    const amount = price * quantity;
    const inputCompleted = item?.input_completed === true;

    if (!groupedMap.has(buyerKey)) {
      groupedMap.set(buyerKey, {
        buyerKey,
        buyer_no: buyerNo,
        branch,
        buyer_name: buyerName,
        contact,
        orders: [],
        totalAmount: 0,
        inputCompletedCount: 0,
        notCompletedCount: 0,
      });
    }

    const group = groupedMap.get(buyerKey)!;
    group.orders.push(order);
    group.totalAmount += amount;

    if (inputCompleted) {
      group.inputCompletedCount += 1;
    } else {
      group.notCompletedCount += 1;
    }
  }

  const groupedOrders = Array.from(groupedMap.values()).sort((a, b) => {
    return a.buyer_no.localeCompare(b.buyer_no) || a.branch.localeCompare(b.branch);
  });

  const totalCount = orderList.length;
  const totalAmount = groupedOrders.reduce((sum, group) => sum + group.totalAmount, 0);
  const inputCompletedTotal = groupedOrders.reduce(
    (sum, group) => sum + group.inputCompletedCount,
    0
  );
  const notCompletedTotal = groupedOrders.reduce(
    (sum, group) => sum + group.notCompletedCount,
    0
  );

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">売約一覧</h1>
          <p className="mt-1 text-sm text-gray-500">
            買参人別に売約商品と入力状況を確認します。
          </p>
        </div>

        <Link href="/admin/exhibition" className="rounded-lg border px-4 py-2 font-bold">
          ← 管理画面へ戻る
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">売約件数</p>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">売約合計</p>
          <p className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</p>
        </div>

        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
          <p className="text-sm font-bold text-blue-800">入力済</p>
          <p className="text-2xl font-bold text-blue-900">{inputCompletedTotal}</p>
        </div>

        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-800">未入力</p>
          <p className="text-2xl font-bold text-red-900">{notCompletedTotal}</p>
        </div>
      </div>

      <div className="space-y-5">
        {groupedOrders.map((group) => (
          <div key={group.buyerKey} className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b bg-gray-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    {group.buyer_name || "店名未入力"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {group.buyer_no}-{group.branch} / {group.contact || "連絡先なし"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border bg-white px-3 py-1 font-bold">
                    {group.orders.length}件
                  </span>
                  <span className="rounded-full border bg-white px-3 py-1 font-bold">
                    ¥{group.totalAmount.toLocaleString()}
                  </span>
                  <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 font-bold text-blue-800">
                    入力済 {group.inputCompletedCount}
                  </span>
                  <span className="rounded-full border border-red-300 bg-red-100 px-3 py-1 font-bold text-red-800">
                    未入力 {group.notCompletedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="p-2 text-left">No</th>
                    <th className="p-2 text-left">商品名</th>
                    <th className="p-2 text-left">規格</th>
                    <th className="p-2 text-right">数量</th>
                    <th className="p-2 text-right">価格（税抜）</th>
                    <th className="p-2 text-left">担当</th>
                    <th className="p-2 text-left">入力</th>
                  </tr>
                </thead>

                <tbody>
                  {group.orders.map((order: any) => {
                    const item = order.exhibition_items;
                    const inputCompleted = item?.input_completed === true;

                    return (
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{item?.item_no ?? "-"}</td>

                        <td className="p-2 font-bold">
                          {item?.id ? (
                            <Link
                              href={`/admin/exhibition/${item.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {item?.product_name ?? "商品名なし"}
                            </Link>
                          ) : (
                            item?.product_name ?? "商品名なし"
                          )}
                        </td>

                        <td className="p-2">{item?.spec ?? "-"}</td>
                        <td className="p-2 text-right">{order.quantity ?? 1}</td>
                        <td className="p-2 text-right">
                          ¥{Number(item?.price ?? 0).toLocaleString()}
                        </td>
                        <td className="p-2">{item?.staff ?? "-"}</td>

                        <td className="p-2">
                          {inputCompleted ? (
                            <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                              入力済
                            </span>
                          ) : (
                            <span className="rounded-full border border-red-300 bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                              未入力
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {groupedOrders.length === 0 && (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
            現在、売約済の商品はありません。
          </div>
        )}
      </div>
    </main>
  );
}
