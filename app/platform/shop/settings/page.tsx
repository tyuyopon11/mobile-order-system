import ShopLogoField from "@/components/forms/ShopLogoField";
import { requireShopAccess } from "@/lib/auth/shop-access";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateVendorShop } from "../actions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const access = await requireShopAccess();
  const query = await searchParams;
  const { data: shop } = await supabaseAdmin
    .from("shops")
    .select("shop_name,slug,short_description,description,announcement,ordering_enabled,accepts_tuesday,accepts_saturday,order_cutoff_hours,logo_url")
    .eq("id", access.shopId)
    .single();
  if (!shop) return <p>ショップ情報を取得できませんでした。</p>;
  const input = "mt-2 w-full rounded-xl border border-stone-300 px-4 py-3";

  return (
    <div>
      <h1 className="text-3xl font-semibold">ショップ設定</h1>
      {query.saved && <p className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">ショップ設定を保存しました。</p>}
      {query.error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{query.error}</p>}
      <form action={updateVendorShop} className="mt-6 space-y-6 rounded-2xl border bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">ショップ名<input value={shop.shop_name} disabled className={`${input} bg-stone-100`} /></label>
          <label className="text-sm">slug<input value={shop.slug} disabled className={`${input} bg-stone-100`} /></label>
        </div>
        <ShopLogoField existingImageUrl={shop.logo_url} />
        <label className="block text-sm">短い紹介文<input name="shortDescription" defaultValue={shop.short_description ?? ""} className={input} /></label>
        <label className="block text-sm">紹介文<textarea name="description" defaultValue={shop.description ?? ""} rows={5} className={input} /></label>
        <label className="block text-sm">ショップからのお知らせ<textarea name="announcement" defaultValue={shop.announcement ?? ""} rows={4} className={input} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">締切時間<input name="orderCutoffHours" type="number" min="1" max="168" defaultValue={shop.order_cutoff_hours} className="ml-3 w-24 rounded-lg border px-3 py-2" />時間前</label>
          <div className="flex flex-wrap gap-5 text-sm">
            <label><input name="orderingEnabled" type="checkbox" defaultChecked={shop.ordering_enabled} className="mr-2" />注文受付ON</label>
            <label><input name="acceptsTuesday" type="checkbox" defaultChecked={shop.accepts_tuesday} className="mr-2" />火曜受付</label>
            <label><input name="acceptsSaturday" type="checkbox" defaultChecked={shop.accepts_saturday} className="mr-2" />土曜受付</label>
          </div>
        </div>
        <button className="rounded-xl bg-green-800 px-6 py-3 text-sm font-medium text-white">設定を保存</button>
      </form>
    </div>
  );
}
