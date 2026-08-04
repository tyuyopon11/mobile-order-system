"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type CancelOrderActionResult = { success: boolean; message: string };

export default function CancelOrderButton({
  orderId,
  orderNumber,
  isCancelled = false,
  action,
}: {
  orderId: string;
  orderNumber: string;
  isCancelled?: boolean;
  action: (orderId: string) => Promise<CancelOrderActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  if (isCancelled) {
    return <span className="inline-flex items-center rounded-xl bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-500">キャンセル済み</span>;
  }

  function handleCancel() {
    if (!window.confirm(`この注文をキャンセルしますか？\n\n注文番号：${orderNumber}\n\nキャンセルすると、この注文で確保していた在庫が販売可能数へ戻ります。`)) return;
    setMessage("");
    startTransition(async () => {
      const result = await action(orderId);
      setMessage(result.message);
      if (result.success) router.refresh();
    });
  }

  return (
    <div>
      <button type="button" onClick={handleCancel} disabled={isPending} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-center text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400">
        {isPending ? "処理中…" : "注文をキャンセル"}
      </button>
      {message ? <p className="mt-2 max-w-xs text-xs leading-5 text-stone-600" role="status">{message}</p> : null}
    </div>
  );
}
