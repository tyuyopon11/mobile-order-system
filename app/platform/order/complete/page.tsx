import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type OrderCompletePageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function OrderCompletePage({
  searchParams,
}: OrderCompletePageProps) {
  const { orderId } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/platform/login");
  }

  if (!orderId) {
    redirect("/platform");
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-stone-200 bg-white p-7 text-center shadow-[0_18px_50px_rgba(54,65,48,0.07)] sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
            ✓
          </div>

          <p className="mt-7 text-xs font-semibold tracking-[0.28em] text-green-800">
            ORDER COMPLETE
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            ご注文ありがとうございます
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-stone-500 sm:text-base">
            ご注文を受け付けました。
            <br />
            内容を確認後、担当者よりご連絡いたします。
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-stone-50 p-5">
            <p className="text-xs font-medium tracking-[0.16em] text-stone-400">
              ORDER ID
            </p>

            <p className="mt-2 break-all text-lg font-semibold text-stone-800">
              {orderId}
            </p>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            <Link
              href="/platform"
              className="rounded-full border border-stone-300 bg-white px-6 py-4 text-sm font-semibold text-stone-700 transition hover:border-green-800 hover:text-green-800"
            >
              Lei Portトップへ
            </Link>

            <Link
              href="/platform/shops"
              className="rounded-full bg-green-800 px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)] transition hover:bg-green-900"
            >
              ショップを見る
            </Link>
          </div>

          <p className="mt-6 text-xs leading-6 text-stone-400">
            注文内容について確認が必要な場合は、
            登録いただいたメールアドレスまたは電話番号へご連絡します。
          </p>
        </section>
      </div>
    </main>
  );
}