import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { logout } from "@/app/platform/login/actions";

type AdminLayoutProps = {
  children: ReactNode;
};

const navigationItems = [
  {
    href: "/platform/admin",
    label: "ダッシュボード",
  },
  {
    href: "/platform/admin/members",
    label: "会員管理",
  },
  {
    href: "/platform/admin/shops",
    label: "ショップ管理",
  },
  {
    href: "/platform/admin/products",
    label: "商品管理",
  },
  {
    href: "/platform/admin/orders",
    label: "注文管理",
  },
];

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const access = await getPlatformAccess();

  if (access.state === "unauthenticated") {
    redirect(
      `/platform/login?next=${encodeURIComponent(
        "/platform/admin"
      )}`
    );
  }

  if (
    !isApprovedPlatformAdmin(access) ||
    !access.platformUser
  ) {
    redirect("/platform");
  }

  const platformUser = access.platformUser;

  return (
    <div className="min-h-screen bg-[#f4f2ec] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <div>
            <Link
              href="/platform/admin"
              className="text-xl font-semibold tracking-tight text-stone-900"
            >
              Lei Port Admin
            </Link>

            <p className="mt-1 text-xs tracking-[0.18em] text-green-800">
              BUSINESS MANAGEMENT
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-stone-800">
                {platformUser.name}
              </p>

              <p className="text-xs text-stone-500">
                {platformUser.email}
              </p>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm lg:sticky lg:top-8 lg:self-start">
          <nav aria-label="管理画面ナビゲーション">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-green-50 hover:text-green-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-4 border-t border-stone-100 pt-4">
            <Link
              href="/platform"
              className="block rounded-xl px-4 py-3 text-sm text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
            >
              ← Lei Portへ戻る
            </Link>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}