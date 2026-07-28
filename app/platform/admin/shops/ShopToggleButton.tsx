"use client";

import { useState, useTransition } from "react";

import {
  setShopFeatured,
  setShopPublished,
} from "./actions";

type ShopToggleButtonProps = {
  shopId: string;
  field: "published" | "is_featured";
  value: boolean;
};

export default function ShopToggleButton({
  shopId,
  field,
  value,
}: ShopToggleButtonProps) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isPublished = field === "published";

  function handleClick() {
    setMessage("");
    startTransition(async () => {
      const result = isPublished
        ? await setShopPublished(shopId, !value)
        : await setShopFeatured(shopId, !value);

      if (!result.ok) {
        setMessage(result.message);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={value}
        className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition disabled:cursor-wait disabled:opacity-60 ${
          value
            ? "border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
        }`}
      >
        {isPending
          ? "更新中…"
          : isPublished
            ? value
              ? "公開中"
              : "非公開"
            : value
              ? "おすすめ"
              : "通常表示"}
      </button>

      {message && (
        <p role="alert" className="mt-1 max-w-36 text-xs text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
