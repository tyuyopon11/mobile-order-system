import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";

type PlatformLayoutProps = {
  children: ReactNode;
};

export default async function PlatformLayout({
  children,
}: PlatformLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      {children}

      {user && (
        <div className="fixed bottom-4 right-4 z-50">
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-neutral-200 bg-white/95 px-5 py-3 text-sm font-medium text-neutral-700 shadow-lg backdrop-blur transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 active:scale-[0.98]"
            >
              ログアウト
            </button>
          </form>
        </div>
      )}
    </>
  );
}