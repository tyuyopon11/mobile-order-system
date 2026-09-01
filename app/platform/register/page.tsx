import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/platform");
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <section className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="border-b border-neutral-100 px-7 py-7 sm:px-9">
            <Link
              href="/platform/login"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
            >
              <span aria-hidden="true">←</span>
              ログイン画面へ戻る
            </Link>
          </div>

          <div className="px-7 py-9 sm:px-9 sm:py-11">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Business Marketplace
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
                新規利用申請
              </h1>

              <p className="mt-3 text-sm leading-7 text-neutral-600">
                必要事項を入力して申請してください。
                <br />
                管理者の承認後にCIRQNEXをご利用いただけます。
              </p>
            </div>

            <RegisterForm />

            <div className="mt-8 border-t border-neutral-100 pt-6">
              <p className="text-center text-xs leading-6 text-neutral-500">
                申請内容は東京フラワーポート運営者が確認します。
                <br />
                承認完了までログインすることはできません。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
