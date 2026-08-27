"use client";

import { useActionState, useState, useTransition } from "react";
import { changeShopAssignment, releaseShopManagerRole, setShopManagerActive, type MemberActionState } from "../actions";

type ShopOption = { id: string; shop_name: string };
const initialState: MemberActionState = { success: false, message: "" };

export default function ShopManagerControls({ memberId, currentShopId, approvalStatus, isActive, shops }: { memberId: string; currentShopId: string | null; approvalStatus: string; isActive: boolean; shops: ShopOption[] }) {
  const boundChange = changeShopAssignment.bind(null, memberId);
  const [shopState, shopAction, shopPending] = useActionState(boundChange, initialState);
  const [actionState, setActionState] = useState(initialState);
  const [pending, startTransition] = useTransition();

  function toggleActive() {
    const label = isActive ? "利用停止" : "利用再開";
    if (!window.confirm(`このショップ管理者を${label}にしますか？`)) return;
    startTransition(async () => setActionState(await setShopManagerActive(memberId, !isActive)));
  }
  function releaseRole() {
    if (!window.confirm("ショップ管理者権限を解除し、Buyerへ変更しますか？管理ショップの割当も解除されます。")) return;
    startTransition(async () => setActionState(await releaseShopManagerRole(memberId)));
  }

  return <div className="mt-6 grid gap-6 lg:grid-cols-2">
    <form action={shopAction} className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">管理ショップ</h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">変更後は新しいショップだけを管理できます。</p>
      <select name="shopId" defaultValue={currentShopId ?? ""} required disabled={shopPending} className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"><option value="" disabled>ショップを選択</option>{shops.map(shop => <option key={shop.id} value={shop.id}>{shop.shop_name}</option>)}</select>
      {shopState.message && <p role="status" className={`mt-3 text-sm ${shopState.success ? "text-green-700" : "text-red-700"}`}>{shopState.message}</p>}
      <button disabled={shopPending} className="mt-4 rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{shopPending ? "変更中..." : "管理ショップを変更"}</button>
    </form>
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">利用状態・権限</h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">{approvalStatus === "pending" ? "この会員は承認待ちです。承認後に利用状態を変更できます。" : "利用停止するとVendor Portalへアクセスできなくなります。"}</p>
      {actionState.message && <p role="status" className={`mt-3 text-sm ${actionState.success ? "text-green-700" : "text-red-700"}`}>{actionState.message}</p>}
      <div className="mt-4 flex flex-wrap gap-3">{approvalStatus !== "pending" && <button type="button" onClick={toggleActive} disabled={pending} className={`rounded-xl px-5 py-3 text-sm font-medium text-white disabled:opacity-50 ${isActive ? "bg-red-700" : "bg-green-800"}`}>{isActive ? "利用停止" : "利用再開"}</button>}<button type="button" onClick={releaseRole} disabled={pending} className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 disabled:opacity-50">Buyerへ変更</button></div>
    </section>
  </div>;
}
