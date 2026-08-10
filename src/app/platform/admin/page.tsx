import Link from "next/link";

const managementCards = [
  {
    href: "/platform/admin/members",
    eyebrow: "MEMBERS",
    title: "会員管理",
    description:
      "利用申請の承認・却下、会員情報、利用状態を管理します。",
  },
  {
    href: "/platform/admin/shops",
    eyebrow: "SHOPS",
    title: "ショップ管理",
    description:
      "出店ショップの登録情報と公開状態を管理します。",
  },
  {
    href: "/platform/admin/products",
    eyebrow: "PRODUCTS",
    title: "商品管理",
    description:
      "各ショップの商品情報、在庫、公開状態を管理します。",
  },
  {
    href: "/platform/admin/orders",
    eyebrow: "ORDERS",
    title: "注文管理",
    description:
      "Lei Portで受け付けた注文と対応状況を確認します。",
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
          </Link>
        ))}
      </section>
    </div>
  );
}
