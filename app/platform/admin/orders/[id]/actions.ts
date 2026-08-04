"use server";

import { getPlatformAccess, isApprovedPlatformAdmin } from "@/lib/auth/platform-user";
import { cancelExhibitionOrder } from "@/lib/orders/cancel-order";

export type CancelOrderResult = { success: boolean; message: string };

function failureMessage(reason: string): string {
  if (reason === "already_cancelled") return "この注文はすでにキャンセル済みです。";
  if (reason === "not_found") return "対象の注文が見つかりません。";
  return "注文をキャンセルできませんでした。";
}

export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  const normalizedId = orderId.trim();
  if (!/^\d+$/.test(normalizedId)) return { success: false, message: "注文を確認できませんでした。" };
  const access = await getPlatformAccess();
  if (!isApprovedPlatformAdmin(access)) return { success: false, message: "この操作を行う権限がありません。" };
  const result = await cancelExhibitionOrder(normalizedId);
  return result.success
    ? { success: true, message: "注文をキャンセルしました。販売可能数へ在庫を戻しました。" }
    : { success: false, message: failureMessage(result.reason) };
}
