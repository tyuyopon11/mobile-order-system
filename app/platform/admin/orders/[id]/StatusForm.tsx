"use client";

import { useState, useTransition } from "react";

import {
  updateOrderStatus,
  type OrderStatusValue,
} from "./actions";

type StatusFormProps = {
  orderId: string;
  currentStatus: OrderStatusValue;
};

const statusOptions: Array<{
  value: OrderStatusValue;
  label: string;
}> = [
  {
    value: "secured",
    label: "注文受付",
  },
  {
    value: "processing",
    label: "対応中",
  },
  {
    value: "shipped",
    label: "出荷済み",
  },
  {
    value: "completed",
    label: "完了",
  },
  {
    value: "cancelled",
    label: "キャンセル",
  },
];

export default function StatusForm({
  orderId,
  currentStatus,
}: StatusFormProps) {
  const [status, setStatus] =
    useState<OrderStatusValue>(currentStatus);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    startTransition(async () => {
      const result = await updateOrderStatus(
        orderId,
        status
      );

      setMessage(result.message);
      setIsSuccess(result.success);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6"
    >
      <label
        htmlFor="order-status"
        className="text-sm font-semibold text-stone-700"
      >
        ステータス
      </label>

      <select
        id="order-status"
        value={status}
        onChange={(event) =>
          setStatus(
            event.target.value as OrderStatusValue
          )
        }
        disabled={isPending}
        className="mt-3 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3.5 text-sm font-medium text-stone-800 outline-none transition focus:border-green-800 focus:ring-2 focus:ring-green-800/10 disabled:cursor-not-allowed disabled:bg-stone-100"
      >
        {statusOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-green-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {isPending
          ? "保存しています..."
          : "ステータスを保存"}
      </button>

      {message ? (
        <p
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${
            isSuccess
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}