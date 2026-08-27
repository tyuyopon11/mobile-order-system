"use client";

import { useActionState } from "react";
import { assignShopManagerRole, type MemberActionState } from "../actions";

type ShopOption = { id: string; shop_name: string };
const initialState: MemberActionState = { success: false, message: "" };

export default function BuyerRoleControls({ memberId, shops }: { memberId: string; shops: ShopOption[] }) {
  const boundAction = assignShopManagerRole.bind(null, memberId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  function confirmChange(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("このBuyerをショップ管理者へ変更しますか？")) event.preventDefault();
  }

  return <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
    <h2 className="text-lg font-semibold text-stone-900">ショップ管理者へ変更</h2>
    <p className="mt-2 text-sm leading-6 text-stone-500">管理するショップを選択して、Vendor Portalの権限を設定します。</p>
    <form action={action} onSubmit={confirmChange} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="min-w-0 flex-1 text-sm font-medium text-stone-800">管理ショップ
        <select name="shopId" required defaultValue="" disabled={pending} className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm">
          <option value="" disabled>ショップを選択</option>
          {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.shop_name}</option>)}
        </select>
      </label>
      <button disabled={pending || shops.length === 0} className="rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{pending ? "変更中..." : "ショップ管理者へ変更"}</button>
    </form>
    {state.message && <p role="status" className={`mt-3 text-sm ${state.success ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
  </section>;
}
