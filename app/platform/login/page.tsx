import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import LoginForm from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

function getSafeRedirectPath(
  value: string | string[] | undefined
): string {
  const rawPath = Array.isArray(value) ? value[0] : value;
  const path = String(rawPath ?? "/platform").trim();

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/platform";
  }

  return path;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const query = await searchParams;
  const nextPath = getSafeRedirectPath(query.next);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <section className="w-full overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="border-b border-neutral-100 px-7 py-7 sm:px-9">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
            >
              <span aria-hidden="true">←</span>
              CIRQNEXへ戻る
            </Link>
          </div>

          <div className="px-7 py-9 sm:px-9 sm:py-11">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Business Marketplace
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
                CIRQNEX
              </h1>

              <p className="mt-3 text-sm leading-7 text-neutral-600">
                会員ログイン
                <br />
                登録済みのメールアドレスでログインしてください。
              </p>
            </div>

            <LoginForm nextPath={nextPath} />

            <div className="mt-7 border-t border-neutral-100 pt-6">
              <p className="text-center text-sm text-neutral-600">
                CIRQNEXを初めて利用する方
              </p>

              <Link
                href="/platform/register"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-base font-medium text-neutral-800 transition hover:border-neutral-500 hover:bg-neutral-50"
              >
                新規利用を申請する
              </Link>
            </div>

            <div className="mt-7 border-t border-neutral-100 pt-6">
              <p className="text-center text-xs leading-6 text-neutral-500">
                CIRQNEXは東京フラワーポートの
                <br />
                承認を受けた事業者向けサービスです。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
