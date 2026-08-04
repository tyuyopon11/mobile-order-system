"use server";

import { getShopAccess } from "@/lib/auth/shop-access";
import { cancelExhibitionOrder } from "@/lib/orders/cancel-order";

export type VendorCancelOrderResult = { success: boolean; message: string };

export async function cancelVendorOrder(orderId: string): Promise<VendorCancelOrderResult> {
  const normalizedId = orderId.trim();
  if (!/^\d+$/.test(normalizedId)) return { success: false, message: "注文を確認できませんでした。" };

  const access = await getShopAccess();
  if (!access) return { success: false, message: "この操作を行う権限がありません。" };

  const result = await cancelExhibitionOrder(normalizedId, access.shopId);
  if (result.success) return { success: true, message: "注文をキャンセルしました。販売可能数へ在庫を戻しました。" };
  if (result.reason === "already_cancelled") return { success: false, message: "この注文はすでにキャンセル済みです。" };
  if (result.reason === "forbidden" || result.reason === "not_found") {
    return { success: false, message: "このショップの注文ではないため操作できません。" };
  }
  return { success: false, message: "注文をキャンセルできませんでした。" };
}
