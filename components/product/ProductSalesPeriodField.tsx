"use client";

import { useState } from "react";

export default function ProductSalesPeriodField({
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
    <fieldset className="rounded-2xl border border-green-100 bg-green-50/40 p-5 sm:col-span-2">
      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-stone-800">
        <input
          name="salesPeriodEnabled"
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          className="h-4 w-4 accent-green-800"
        />
        販売期間を設定する
      </label>
      <p className="mt-2 text-xs leading-5 text-stone-500">
        設定しない場合は、公開中の商品を通常どおり販売します。
      </p>
      {enabled && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">販売開始日
            <input name="salesStartDate" type="date" required defaultValue={defaultStartDate} className={input} />
          </label>
          <label className="text-sm">販売終了日
            <input name="salesEndDate" type="date" required defaultValue={defaultEndDate} className={input} />
          </label>
        </div>
      )}
    </fieldset>
  );
}
