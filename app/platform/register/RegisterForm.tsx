"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  register,
  type RegisterState,
} from "./actions";

const initialState: RegisterState = {
  success: false,
  message: null,
  fieldErrors: {},
};

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-xs leading-5 text-red-600">
      {message}
    </p>
  );
}

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    register,
    initialState
  );

  if (state.success) {
    return (
      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-6 py-7 text-center">
        <div className="text-4xl" aria-hidden="true">
          🌿
        </div>

        <h2 className="mt-4 text-xl font-semibold text-green-900">
          利用申請を受け付けました
        </h2>

        <p className="mt-3 text-sm leading-7 text-green-800">
          管理者の承認後にログインできます。
          <br />
          承認されるまでしばらくお待ちください。
        </p>

        <Link
          href="/platform/login"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          ログイン画面へ戻る
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100";

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state.message && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="companyName"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            会社名・屋号
            <span className="ml-1 text-red-600">*</span>
          </label>

          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            required
            disabled={isPending}
            placeholder="株式会社〇〇園芸"
            className={inputClass}
          />

          <FieldError
            message={state.fieldErrors.companyName}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            担当者名
            <span className="ml-1 text-red-600">*</span>
          </label>

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            disabled={isPending}
            placeholder="山田 太郎"
            className={inputClass}
          />

          <FieldError message={state.fieldErrors.name} />
        </div>

        <div>
          <label
            htmlFor="buyerNo"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            買参番号
          </label>

          <input
            id="buyerNo"
            name="buyerNo"
            type="text"
            inputMode="numeric"
            disabled={isPending}
            placeholder="1234"
            className={inputClass}
          />

          <FieldError
            message={state.fieldErrors.buyerNo}
          />
        </div>

        <div>
          <label
            htmlFor="branchNo"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            枝番
          </label>

          <input
            id="branchNo"
            name="branchNo"
            type="text"
            inputMode="numeric"
            disabled={isPending}
            placeholder="01"
            className={inputClass}
          />

          <FieldError
            message={state.fieldErrors.branchNo}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            電話番号
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            disabled={isPending}
            placeholder="03-1234-5678"
            className={inputClass}
          />

          <FieldError message={state.fieldErrors.phone} />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            メールアドレス
            <span className="ml-1 text-red-600">*</span>
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            disabled={isPending}
            placeholder="example@company.jp"
            className={inputClass}
          />

          <FieldError message={state.fieldErrors.email} />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            パスワード
            <span className="ml-1 text-red-600">*</span>
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={isPending}
            placeholder="8文字以上"
            className={inputClass}
          />

          <FieldError
            message={state.fieldErrors.password}
          />
        </div>

        <div>
          <label
            htmlFor="passwordConfirm"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            パスワード確認
            <span className="ml-1 text-red-600">*</span>
          </label>

          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={isPending}
            placeholder="もう一度入力"
            className={inputClass}
          />

          <FieldError
            message={state.fieldErrors.passwordConfirm}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3.5 text-base font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
      >
        {isPending ? "申請中..." : "利用申請を送信"}
      </button>
    </form>
  );
}
