import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function BuyerOrderHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/platform/login?next=%2Fplatform%2Fmypage%2Forders");

  const { data: profile } = await supabase
    .from("platform_users")
    .select("buyer_no,branch_no")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  let query = supabase
    .from("exhibition_orders")
    .select(`
      id,order_number,auction_date,quantity,irisu,ordered_at,
      exhibition_items(product_name,price,shops(shop_name))
    `)
    .order("ordered_at", { ascending: false });
  if (profile?.buyer_no) query = query.eq("buyer_no", profile.buyer_no);
  if (profile?.branch_no) query = query.eq("branch_no", profile.branch_no);
  const { data: orders } = await query;

  return (
    <main className="min-h-screen bg-[#f5f4ef] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/platform" className="text-sm font-semibold text-green-800">← CIRQNEXへ戻る</Link>
        <h1 className="mt-6 text-3xl font-semibold text-stone-900">注文履歴</h1>
        <div className="mt-8 space-y-4">
          {(orders ?? []).map((order: any) => {
            const item = Array.isArray(order.exhibition_items) ? order.exhibition_items[0] : order.exhibition_items;
            const shop = Array.isArray(item?.shops) ? item.shops[0] : item?.shops;
            return (
              <article key={order.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs text-stone-400">注文番号</p><p className="font-semibold">{order.order_number ?? order.id}</p></div>
                  <time className="text-xs text-stone-400">{new Date(order.ordered_at).toLocaleString("ja-JP")}</time>
                </div>
                <dl className="mt-4 grid gap-3 border-t border-stone-100 pt-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-stone-400">ショップ</dt><dd>{shop?.shop_name ?? "—"}</dd></div>
                  <div><dt className="text-stone-400">商品</dt><dd>{item?.product_name ?? "—"}</dd></div>
                  <div><dt className="text-stone-400">競り日</dt><dd>{order.auction_date ?? "—"}</dd></div>
                  <div><dt className="text-stone-400">注文数</dt><dd>{order.quantity}ケース（{order.quantity * order.irisu}鉢）</dd></div>
                </dl>
              </article>
            );
          })}
          {!orders?.length && <p className="rounded-2xl bg-white p-8 text-center text-stone-500">注文履歴はありません。</p>}
        </div>
      </div>
    </main>
  );
}
