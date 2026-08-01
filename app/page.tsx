import HomeClient, { type HomeShop } from "./HomeClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isShopPublished } from "@/lib/shops/publication";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data } = await supabaseAdmin
    .from("shops")
    .select("shop_name,slug,short_description,description,shop_type,published,show_on_public_site")
    .eq("show_on_public_site", true)
    .order("display_order", { ascending: true });

  const shops: HomeShop[] = (data ?? []).map((shop) => ({
    name: shop.shop_name,
    category: String(shop.shop_type ?? "MARKETPLACE").replaceAll("_", " ").toUpperCase(),
    description: shop.short_description || shop.description || "Lei Port Marketplaceのショップです。",
    href: `/platform/shops/${shop.slug}`,
    status: isShopPublished(shop) ? "OPEN" : "COMING SOON",
  }));

  return <HomeClient shops={shops} />;
}
