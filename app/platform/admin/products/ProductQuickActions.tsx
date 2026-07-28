"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  setProductFeatured,
  setProductPublished,
  setProductStatus,
} from "./actions";

type ProductQuickActionsProps = {
  productId: number;
  published: boolean;
  isFeatured: boolean;
  status: "preparing" | "selling" | "sold";
};

export default function ProductQuickActions({
  productId,
  published,
  isFeatured,
  status,
}: ProductQuickActionsProps) {
  const router = useRouter();
  const [currentPublished, setCurrentPublished] = useState(published);
  const [currentFeatured, setCurrentFeatured] = useState(isFeatured);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<{ ok: boolean; message: string }>,
    onSuccess: () => void
  ) {
    setMessage("");
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);

      if (result.ok) {
        onSuccess();
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      <select
        aria-label="販売状態"
        value={currentStatus}
        disabled={isPending}
        onChange={(event) => {
          const nextStatus = event.target.value as
            | "preparing"
            | "selling"
            | "sold";
          run(
            () => setProductStatus(String(productId), nextStatus),
            () => {
              setCurrentStatus(nextStatus);
              if (nextStatus === "preparing") setCurrentPublished(false);
            }
          );
        }}
        className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 disabled:opacity-50"
      >
        <option value="preparing">準備中</option>
        <option value="selling">販売中</option>
        <option value="sold">売約済み</option>
      </select>

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          run(
            () =>
              setProductPublished(String(productId), !currentPublished),
            () => setCurrentPublished((value) => !value)
          )
        }
        className={`rounded-xl border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
          currentPublished
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {currentPublished ? "公開中" : "非公開"}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          run(
            () =>
              setProductFeatured(String(productId), !currentFeatured),
            () => setCurrentFeatured((value) => !value)
          )
        }
        className={`rounded-xl border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
          currentFeatured
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-stone-200 bg-white text-stone-600"
        }`}
      >
        {currentFeatured ? "おすすめ" : "通常表示"}
      </button>

      {message && (
        <p
          role="status"
          className={`w-full text-xs ${
            message.includes("できません") ||
            message.includes("正しくありません")
              ? "text-red-600"
              : "text-green-700"
          }`}
        >
          {isPending ? "更新中…" : message}
        </p>
      )}
    </div>
  );
}
