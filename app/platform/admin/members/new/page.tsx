import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ShopManagerForm from "./ShopManagerForm";

export default async function NewShopManagerPage() {
  const { data: shops, error } = await supabaseAdmin.from("shops").select("id,shop_name").order("display_order").order("shop_name");
  return <div>
    <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
      <p className="text-xs font-semibold tracking-[0.28em] text-green-800">SHOP MANAGER</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">ショップ管理者登録</h1>
      <p className="mt-4 text-sm leading-7 text-stone-500">担当者のアカウントと管理ショップを登録します。</p>
    </section>
    {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">ショップ一覧を取得できませんでした。</p>}
    <ShopManagerForm shops={shops ?? []} />
  </div>;
}
