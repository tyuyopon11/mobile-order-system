"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteShop(shopId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { favorite: false, error: "ログインしてください。" };

  const { data: existing } = await supabase
    .from("favorite_shops")
    .select("shop_id")
    .eq("user_id", user.id)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorite_shops")
      .delete()
      .eq("user_id", user.id)
      .eq("shop_id", shopId);
    if (error) return { favorite: true, error: error.message };
    revalidatePath("/platform");
    return { favorite: false, error: null };
  }

  const { error } = await supabase
    .from("favorite_shops")
    .insert({ user_id: user.id, shop_id: shopId });
  if (error) return { favorite: false, error: error.message };
  revalidatePath("/platform");
  return { favorite: true, error: null };
}
