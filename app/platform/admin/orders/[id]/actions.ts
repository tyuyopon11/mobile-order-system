"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type OrderStatusValue =
  | "secured"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type UpdateOrderStatusResult = {
  success: boolean;
  message: string;
};

function isOrderStatusValue(
  value: string
): value is OrderStatusValue {
  return [
    "secured",
    "processing",
    "shipped",
    "completed",
    "cancelled",
  ].includes(value);
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<UpdateOrderStatusResult> {
  if (!orderId.trim()) {
    return {
      success: false,
      message: "注文IDを確認できませんでした。",
    };
  }

  if (!isOrderStatusValue(status)) {
    return {
      success: false,
      message: "選択されたステータスが正しくありません。",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message:
        "ログイン情報を確認できませんでした。再度ログインしてください。",
    };
  }

  const isCancelled = status === "cancelled";

  const updateValues = isCancelled
    ? {
        status: "cancelled",
        cancelled: true,
      }
    : {
        status,
        cancelled: false,
      };

  const { data, error } = await supabase
    .from("exhibition_orders")
    .update(updateValues)
    .eq("id", orderId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Order status update error:", error);

    return {
      success: false,
      message: "ステータスを更新できませんでした。",
    };
  }

  if (!data) {
    return {
      success: false,
      message: "対象の注文が見つかりませんでした。",
    };
  }

  revalidatePath(`/platform/admin/orders/${orderId}`);
  revalidatePath("/platform/admin/orders");

  return {
    success: true,
    message: "ステータスを保存しました。",
  };
}