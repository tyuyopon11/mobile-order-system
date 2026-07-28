import { createClient } from "@/lib/supabase/server";

export type ShopType =
  | "market"
  | "plant_shop"
  | "producer"
  | "vendor"
  | "corporate"
  | "brand"
  | "exhibition"
  | "official";

export type Shop = {
  id: string;
  shop_name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  short_description: string | null;
  display_order: number;
  published: boolean;
  published_at: string | null;
  is_featured: boolean;
  shop_type: ShopType | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  website_url: string | null;
  instagram_url: string | null;
  owner_user_id: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  ordering_enabled: boolean;
  accepts_tuesday: boolean;
  accepts_saturday: boolean;
  order_cutoff_hours: number;
  announcement: string | null;
};

const SHOP_COLUMNS = [
  "id",
  "shop_name",
  "slug",
  "logo_url",
  "banner_url",
  "description",
  "short_description",
  "display_order",
  "published",
  "published_at",
  "is_featured",
  "shop_type",
  "contact_email",
  "phone",
  "address",
  "website_url",
  "instagram_url",
  "owner_user_id",
  "updated_by",
  "created_at",
  "updated_at",
  "ordering_enabled",
  "accepts_tuesday",
  "accepts_saturday",
  "order_cutoff_hours",
  "announcement",
].join(",");

export async function getShop(slug: string): Promise<Shop> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shops")
    .select(SHOP_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as Shop;
}

export async function getShops(): Promise<Shop[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shops")
    .select(SHOP_COLUMNS)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as Shop[];
}

export async function getShopById(id: string): Promise<Shop | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shops")
    .select(SHOP_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as Shop | null;
}
