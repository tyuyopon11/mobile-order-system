import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logMission25Perf, startMission25Perf } from "@/lib/performance/mission25-perf";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const authStartedAt = startMission25Perf();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  logMission25Perf("proxy.auth", authStartedAt);

  if (!user) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/platform/login";
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    const redirectResponse = NextResponse.redirect(loginUrl);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // Mission24初期版で /platform/shop 限定だった管理者ショップCookieを、
  // CSV APIにも届くルートCookieへ自動移行する。
  if (request.nextUrl.pathname.startsWith("/platform/shop")) {
    const selectedShopId = request.cookies.get("lei_port_admin_shop")?.value;
    if (selectedShopId) {
      supabaseResponse.cookies.set("lei_port_admin_shop", selectedShopId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/platform/order/:path*",
    "/platform/mypage/:path*",
    "/platform/shop/:path*",
  ],
};
