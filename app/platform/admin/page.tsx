import Link from "next/link";

const managementCards = [
  {
    href: "/platform/admin/members",
    eyebrow: "MEMBERS",
    title: "会員管理",
    description:
      "利用申請の承認・却下、会員情報、利用状態を管理します。",
    status: "Mission019-04で構築中",
  },
  {
    href: "/platform/admin/shops",
    eyebrow: "SHOPS",
    title: "ショップ管理",
    description:
      "出店ショップの登録情報と公開状態を管理します。",
    status: "準備中",
  },
  {
    href: "/platform/admin/products",
    eyebrow: "PRODUCTS",
    title: "商品管理",
    description:
      "各ショップの商品情報、在庫、公開状態を管理します。",
    status: "準備中",
  },
  {
    href: "/platform/admin/orders",
    eyebrow: "ORDERS",
    title: "注文管理",
    description:
      "Lei Portで受け付けた注文と対応状況を確認します。",
    status: "準備中",
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          DASHBOARD
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Lei Port 管理画面
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-500 sm:text-base">
          会員、ショップ、商品、注文を管理する運営者専用ダッシュボードです。
          まずは会員承認フローから順番に整備していきます。
        </p>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        {managementCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md sm:p-7"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
                  {card.eyebrow}
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-stone-900">
                  {card.title}
                </h2>
              </div>

              <span
                aria-hidden="true"
                className="text-xl text-stone-300 transition group-hover:translate-x-1 group-hover:text-green-700"
              >
                →
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-stone-500">
              {card.description}
            </p>

            <div className="mt-6 border-t border-stone-100 pt-5">
              <span className="inline-flex rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
                {card.status}
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-[24px] border border-green-100 bg-green-50/60 px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
          CURRENT MISSION
        </p>

        <h2 className="mt-3 text-xl font-semibold text-stone-900">
          Mission019-04 管理者承認フロー
        </h2>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          承認待ち・承認済み・却下・利用停止を一覧で確認し、
          管理者が会員の状態を安全に更新できる仕組みを構築します。
        </p>

        <Link
          href="/platform/admin/members"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-900"
        >
          会員管理を開く
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}