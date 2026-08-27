"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createShopManager, type ShopManagerActionState } from "../actions";

type ShopOption = { id: string; shop_name: string };
const initialState: ShopManagerActionState = { success: false, message: "", fieldErrors: {} };

export default function ShopManagerForm({ shops }: { shops: ShopOption[] }) {
  const [state, action, pending] = useActionState(createShopManager, initialState);
  const fieldClass = "mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50 disabled:bg-stone-100";
  return <form action={action} className="mt-6 space-y-5 rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="メールアドレス" error={state.fieldErrors.email}><input name="email" type="email" required disabled={pending} className={fieldClass} /></Field>
      <Field label="担当者名" error={state.fieldErrors.name}><input name="name" required maxLength={100} disabled={pending} className={fieldClass} /></Field>
      <Field label="会社名" error={state.fieldErrors.companyName}><input name="companyName" required maxLength={200} disabled={pending} className={fieldClass} /></Field>
      <Field label="電話番号（任意）" error={state.fieldErrors.phone}><input name="phone" type="tel" maxLength={30} disabled={pending} className={fieldClass} /></Field>
      <Field label="管理ショップ" error={state.fieldErrors.shopId}><select name="shopId" required disabled={pending} defaultValue="" className={fieldClass}><option value="" disabled>ショップを選択</option>{shops.map(shop => <option key={shop.id} value={shop.id}>{shop.shop_name}</option>)}</select></Field>
      <div />
      <Field label="初期パスワード" error={state.fieldErrors.password}><input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" disabled={pending} className={fieldClass} /></Field>
      <Field label="初期パスワード（確認）" error={state.fieldErrors.passwordConfirm}><input name="passwordConfirm" type="password" required minLength={8} maxLength={72} autoComplete="new-password" disabled={pending} className={fieldClass} /></Field>
    </div>
    <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">登録後は「承認待ち」に入ります。内容を確認して承認すると利用を開始できます。初期パスワードは担当者へ安全な方法で共有してください。</p>
    {state.message && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/platform/admin/members" className="rounded-xl border border-stone-300 px-5 py-3 text-center text-sm font-medium text-stone-700">戻る</Link><button disabled={pending || shops.length === 0} className="rounded-xl bg-green-800 px-6 py-3 text-sm font-medium text-white hover:bg-green-900 disabled:opacity-50">{pending ? "登録中..." : "承認待ちとして登録"}</button></div>
  </form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-stone-800">{label}{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
