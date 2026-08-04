"use server";

import { revalidatePath } from "next/cache";
import { getPlatformAccess, isApprovedPlatformAdmin } from "@/lib/auth/platform-user";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type CancelOrderResult = { success: boolean; message: string };

type OrderForCancellation = {
  id: number;
  status: string | null;
  cancelled: boolean | null;
  item_id: number | null;
  exhibition_items:
    | { shops: { slug: string | null } | { slug: string | null }[] | null }
    | { shops: { slug: string | null } | { slug: string | null }[] | null }[]
    | null;
};

function first<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  const normalizedId = orderId.trim();
  if (!/^\d+$/.test(normalizedId)) {
    return { success: false, message: "注文を確認できませんでした。" };
  }

  const access = await getPlatformAccess();
  if (!isApprovedPlatformAdmin(access)) {
    return { success: false, message: "この操作を行う権限がありません。" };
  }

  const { data: current, error: fetchError } = await supabaseAdmin
    .from("exhibition_orders")
    .select("id,status,cancelled,item_id,exhibition_items(shops(slug))")
    .eq("id", normalizedId)
    .maybeSingle();

  if (fetchError || !current) {
    console.error("Order cancellation fetch error:", fetchError);
    return { success: false, message: "対象の注文が見つかりません。" };
  }

  const order = current as unknown as OrderForCancellation;
  if (order.cancelled === true || order.status === "cancelled") {
    return { success: false, message: "この注文はすでにキャンセル済みです。" };
  }

  const { data: cancelledOrder, error: updateError } = await supabaseAdmin
    .from("exhibition_orders")
    .update({ status: "cancelled", cancelled: true })
    .eq("id", normalizedId)
    .or("cancelled.is.null,cancelled.eq.false")
    .neq("status", "cancelled")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("Order cancellation update error:", updateError);
    return { success: false, message: "注文をキャンセルできませんでした。" };
  }
  if (!cancelledOrder) {
    return { success: false, message: "この注文はすでにキャンセル済みです。" };
  }

  const item = first(order.exhibition_items);
  const shop = first(item?.shops ?? null);
  revalidatePath(`/platform/admin/orders/${normalizedId}`);
  revalidatePath("/platform/admin/orders");
  revalidatePath("/platform/shop/orders");
  if (order.item_id) {
    revalidatePath(`/platform/products/${order.item_id}`);
    revalidatePath(`/platform/order/${order.item_id}`);
  }
  if (shop?.slug) revalidatePath(`/platform/shops/${shop.slug}`);

  return { success: true, message: "注文をキャンセルしました。販売可能数へ在庫を戻しました。" };
}
