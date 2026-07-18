import { createClient } from "@/lib/supabase/server";

export async function getShop(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}