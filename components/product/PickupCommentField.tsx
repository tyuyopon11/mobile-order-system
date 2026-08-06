"use client";

import { useState } from "react";

const MAX_LENGTH = 500;

export default function PickupCommentField({
  defaultValue = "",
  disabled = false,
}: {
  defaultValue?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <section className="rounded-2xl border border-green-100 bg-green-50/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-green-800">PICKUP COMMENT</p>
          <h2 className="mt-2 text-lg font-semibold text-stone-900">🌱 先取りコメント</h2>
        </div>
        <button type="button" onClick={() => window.alert("準備中です")} disabled={disabled} className="rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:text-stone-400">
          ✨ AIで作成（準備中）
        </button>
      </div>
      <p className="mt-3 text-sm leading-7 text-stone-600">
        この商品を選んだ理由や、おすすめしたいポイントを入力してください。
        <span className="block text-xs text-stone-400">300〜500文字程度</span>
      </p>
      <textarea
        id="pickupComment"
        name="pickupComment"
        rows={8}
        maxLength={MAX_LENGTH}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-stone-100"
      />
      <p className="mt-2 text-right text-xs text-stone-400" aria-live="polite">
        {value.length} / {MAX_LENGTH}文字
      </p>
    </section>
  );
}
