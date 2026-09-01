import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlatformAccess } from "@/lib/auth/platform-user";
import { logout } from "@/app/platform/login/actions";

type StatusView = {
  eyebrow: string;
  title: string;
  message: string;
  detail: string;
};

function getStatusView(state: string): StatusView {
  switch (state) {
    case "pending":
      return {
        eyebrow: "APPLICATION PENDING",
        title: "利用申請を確認中です",
        message:
          "現在、東京フラワーポートが登録内容を確認しています。",
        detail:
          "承認後に商品詳細・注文機能をご利用いただけます。",
      };

    case "rejected":
      return {
        eyebrow: "APPLICATION STATUS",
        title: "現在、このアカウントではご利用いただけません",
        message:
          "CIRQNEXへの利用申請は、現在承認されていない状態です。",
        detail:
          "登録内容については東京フラワーポート担当者までお問い合わせください。",
      };

    case "inactive":
      return {
        eyebrow: "ACCOUNT INACTIVE",
        title: "現在、このアカウントは利用停止中です",
        message:
          "承認済みのアカウントですが、現在は利用できない状態です。",
        detail:
          "詳細については東京フラワーポート担当者までお問い合わせください。",
      };

    default:
      return {
        eyebrow: "ACCOUNT ERROR",
        title: "利用者情報を確認できませんでした",
        message:
          "ログイン情報に対応するCIRQNEX利用者情報が見つかりません。",
        detail:
          "お手数ですが、東京フラワーポート担当者までお問い合わせください。",
      };
  }
}

export default async function AccountStatusPage() {
  const access = await getPlatformAccess();

  if (access.state === "unauthenticated") {
    redirect("/platform/login");
  }

  if (access.state === "approved") {
    redirect("/platform");
  }

  const view = getStatusView(access.state);

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
        <section className="w-full rounded-[30px] border border-black/5 bg-white px-7 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:px-12 sm:py-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
            🌿
          </div>

          <p className="mt-7 text-xs font-semibold tracking-[0.28em] text-green-800">
            {view.eyebrow}
          </p>

          <h1 className="mt-4 text-2xl font-semibold leading-relaxed text-neutral-900 sm:text-3xl">
            {view.title}
          </h1>

          <p className="mt-6 text-sm leading-7 text-neutral-600 sm:text-base">
            {view.message}
          </p>

          <p className="mt-2 text-sm leading-7 text-neutral-500">
            {view.detail}
          </p>

          {access.platformUser && (
            <div className="mt-8 rounded-2xl bg-neutral-50 px-5 py-4 text-left text-sm text-neutral-600">
              <div className="flex justify-between gap-4 border-b border-neutral-200 py-2">
                <span className="text-neutral-400">お名前</span>
                <span className="text-right font-medium text-neutral-700">
                  {access.platformUser.name}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-2">
                <span className="text-neutral-400">会社名</span>
                <span className="text-right font-medium text-neutral-700">
                  {access.platformUser.company_name}
                </span>
              </div>
            </div>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/platform"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              CIRQNEX TOPへ
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 sm:w-auto"
              >
                ログアウト
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
