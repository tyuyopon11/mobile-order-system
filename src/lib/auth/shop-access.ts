import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
  isApprovedShopUser,
} from "@/lib/auth/platform-user";
import { logMission25Perf, startMission25Perf } from "@/lib/performance/mission25-perf";

export const ADMIN_SHOP_COOKIE = "lei_port_admin_shop";

export type ShopAccess = {
  shopId: string;
  shopName: string;
  slug: string;
  isAdminMode: boolean;
  userId: string;
};

export const getShopAccess = cache(async function getShopAccess(): Promise<ShopAccess | null> {
  const totalStartedAt = startMission25Perf();
  const access = await getPlatformAccess();
  if (access.state !== "approved" || !access.platformUser) {
    logMission25Perf("shop_access.total", totalStartedAt);
    return null;
  }

  let shopId: string | null = null;
  let isAdminMode = false;
  if (isApprovedPlatformAdmin(access)) {
    isAdminMode = true;
    shopId = (await cookies()).get(ADMIN_SHOP_COOKIE)?.value ?? null;
    if (!shopId) {
      const defaultShopStartedAt = startMission25Perf();
      const { data } = await supabaseAdmin.from("shops").select("id").order("display_order").limit(1).maybeSingle();
      logMission25Perf("shop.default_query", defaultShopStartedAt);
      shopId = data?.id ?? null;
    }
  } else if (isApprovedShopUser(access)) {
    shopId = access.platformUser.shop_id;
  }
  if (!shopId) {
    logMission25Perf("shop_access.total", totalStartedAt);
    return null;
  }

  const shopQueryStartedAt = startMission25Perf();
  const { data: shop } = await supabaseAdmin
    .from("shops")
    .select("id,shop_name,slug")
    .eq("id", shopId)
    .maybeSingle();
  logMission25Perf("shop.query", shopQueryStartedAt);
  if (!shop) {
    logMission25Perf("shop_access.total", totalStartedAt);
    return null;
  }
  logMission25Perf("shop_access.total", totalStartedAt);
  return { shopId: shop.id, shopName: shop.shop_name, slug: shop.slug, isAdminMode, userId: access.platformUser.id };
});

export async function requireShopAccess() {
  const access = await getShopAccess();
  if (!access) redirect("/platform");
  return access;
}

export async function canManageShop(shopId: string) {
  const access = await getPlatformAccess();
  if (isApprovedPlatformAdmin(access)) return access.platformUser ?? null;
  if (isApprovedShopUser(access) && access.platformUser?.shop_id === shopId) return access.platformUser;
  return null;
}
