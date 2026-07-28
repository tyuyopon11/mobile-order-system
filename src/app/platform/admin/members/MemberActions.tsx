"use client";

import { useState, useTransition } from "react";

import {
  approveMember,
  rejectMember,
  type MemberActionState,
} from "./actions";

type MemberActionsProps = {
  memberId: string;
  memberName: string;
  companyName: string;
};

const initialState: MemberActionState = {
  success: false,
  message: "",
};

export default function MemberActions({
  memberId,
  memberName,
  companyName,
}: MemberActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [result, setResult] =
    useState<MemberActionState>(initialState);

  function handleApprove() {
    const confirmed = window.confirm(
      `${companyName}（${memberName}）を承認しますか？`
    );

    if (!confirmed) {
      return;
    }

    setResult(initialState);

    startTransition(async () => {
      const nextResult = await approveMember(memberId);
      setResult(nextResult);
    });
  }

  function handleReject() {
    setResult(initialState);

    startTransition(async () => {
      const nextResult = await rejectMember(memberId, reason);
      setResult(nextResult);

      if (nextResult.success) {
        setReason("");
        setIsRejectOpen(false);
      }
    });
  }

  function openRejectDialog() {
    setResult(initialState);
    setReason("");
    setIsRejectOpen(true);
  }

  function closeRejectDialog() {
    if (isPending) {
      return;
    }

    setIsRejectOpen(false);
    setReason("");
    setResult(initialState);
  }

  return (
    <>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "処理中..." : "承認"}
        </button>

        <button
          type="button"
          onClick={openRejectDialog}
          disabled={isPending}
          className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          却下
        </button>
      </div>

      {result.message && (
        <p
          className={`mt-3 text-sm ${
            result.success
              ? "text-green-700"
              : "text-red-700"
          }`}
          role="status"
        >
          {result.message}
        </p>
      )}

      {isRejectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`reject-title-${memberId}`}
        >
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-semibold tracking-[0.22em] text-red-700">
              REJECT APPLICATION
            </p>

            <h2
              id={`reject-title-${memberId}`}
              className="mt-3 text-2xl font-semibold text-stone-900"
            >
              会員申請を却下
            </h2>

            <p className="mt-4 text-sm leading-7 text-stone-600">
              <span className="font-medium text-stone-900">
                {companyName}
              </span>
              <br />
              {memberName}さんの申請を却下します。
            </p>

            <label
              htmlFor={`rejection-reason-${memberId}`}
              className="mt-6 block text-sm font-medium text-stone-800"
            >
              却下理由
            </label>

            <textarea
              id={`rejection-reason-${memberId}`}
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              maxLength={500}
              rows={5}
              disabled={isPending}
              placeholder="登録内容の不足など、却下理由を入力してください。"
              className="mt-2 w-full resize-none rounded-2xl border border-stone-300 px-4 py-3 text-sm leading-6 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-red-400 focus:ring-4 focus:ring-red-50 disabled:bg-stone-100"
            />

            <div className="mt-2 flex items-center justify-between gap-4 text-xs text-stone-400">
              <span>必須・500文字以内</span>
              <span>{reason.length}/500</span>
            </div>

            {result.message && (
              <p
                className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                  result.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
                role="status"
              >
                {result.message}
              </p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectDialog}
                disabled={isPending}
                className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                キャンセル
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={isPending || !reason.trim()}
                className="rounded-xl bg-red-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "処理中..." : "却下を確定"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}