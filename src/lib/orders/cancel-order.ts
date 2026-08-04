import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type CancelOrderServiceResult =
  | { success: true }
  | { success: false; reason: "not_found" | "forbidden" | "already_cancelled" | "update_failed" };

type ScopedOrder = {
  id: number;
  item_id: number;
  status: string | null;
  cancelled: boolean | null;
  exhibition_items:
    | { shop_id: string; shops: { slug: string | null } | { slug: string | null }[] | null }
    | { shop_id: string; shops: { slug: string | null } | { slug: string | null }[] | null }[]
    | null;
};

function first<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function cancelExhibitionOrder(
  orderId: string,
  allowedShopId?: string
): Promise<CancelOrderServiceResult> {
  const { data, error } = await supabaseAdmin
    .from("exhibition_orders")
    .select("id,item_id,status,cancelled,exhibition_items(shop_id,shops(slug))")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Order cancellation fetch error:", error);
    return { success: false, reason: "not_found" };
  }

  const order = data as unknown as ScopedOrder;
  const item = first(order.exhibition_items);
  if (!item) return { success: false, reason: "not_found" };
  if (allowedShopId && item.shop_id !== allowedShopId) {
    return { success: false, reason: "forbidden" };
  }
  if (order.cancelled === true || order.status === "cancelled") {
    return { success: false, reason: "already_cancelled" };
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("exhibition_orders")
    .update({ status: "cancelled", cancelled: true })
    .eq("id", orderId)
    .eq("item_id", order.item_id)
    .or("cancelled.is.null,cancelled.eq.false")
    .neq("status", "cancelled")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("Order cancellation update error:", updateError);
    return { success: false, reason: "update_failed" };
  }
  if (!updated) return { success: false, reason: "already_cancelled" };

  const shop = first(item.shops);
  revalidatePath(`/platform/admin/orders/${orderId}`);
  revalidatePath("/platform/admin/orders");
  revalidatePath("/platform/shop");
  revalidatePath("/platform/shop/orders");
  revalidatePath(`/platform/products/${order.item_id}`);
  revalidatePath(`/platform/order/${order.item_id}`);
  if (shop?.slug) revalidatePath(`/platform/shops/${shop.slug}`);
  return { success: true };
}
