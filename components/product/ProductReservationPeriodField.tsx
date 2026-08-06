"use client";

import { useState } from "react";

export default function ProductReservationPeriodField({
  defaultEnabled = false,
  defaultStartDate = "",
  defaultEndDate = "",
}: {
  defaultEnabled?: boolean;
  defaultStartDate?: string;
  defaultEndDate?: string;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const input = "mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm";
  return (
    <fieldset className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 sm:col-span-2">
      <legend className="px-2 text-sm font-semibold text-amber-900">予約受付期間</legend>
      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-stone-800">
        <input name="reservationPeriodEnabled" type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="h-4 w-4 accent-green-800" />
        予約受付期間を設定する
      </label>
      <p className="mt-2 text-xs leading-5 text-stone-500">注文を受け付ける期間です。納品可能期間とは別に設定します。</p>
      {enabled ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">受付開始日<input name="reservationStartDate" type="date" required defaultValue={defaultStartDate} className={input} /></label>
          <label className="text-sm">受付終了日<input name="reservationEndDate" type="date" required defaultValue={defaultEndDate} className={input} /></label>
        </div>
      ) : null}
    </fieldset>
  );
}
