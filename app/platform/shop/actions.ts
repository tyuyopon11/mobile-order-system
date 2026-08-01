"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_SHOP_COOKIE, canManageShop, requireShopAccess } from "@/lib/auth/shop-access";
import { getPlatformAccess, isApprovedPlatformAdmin } from "@/lib/auth/platform-user";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function openAdminShop(formData: FormData) {
  const auth = await getPlatformAccess();
  if (!isApprovedPlatformAdmin(auth)) redirect("/platform");
  const shopId = String(formData.get("shopId") ?? "");
  const { data } = await supabaseAdmin.from("shops").select("id").eq("id", shopId).maybeSingle();
  if (!data) redirect("/platform/admin/shops");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SHOP_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/platform/shop", maxAge: 0 });
  cookieStore.set(ADMIN_SHOP_COOKIE, shopId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  redirect("/platform/shop");
}

export async function updateVendorShop(formData: FormData) {
  const access = await requireShopAccess();
  const user = await canManageShop(access.shopId);
  if (!user) redirect("/platform");
  await supabaseAdmin.from("shops").update({
    short_description: String(formData.get("shortDescription") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    announcement: String(formData.get("announcement") ?? "").trim() || null,
    logo_url: String(formData.get("logoUrl") ?? "").trim() || null,
    ordering_enabled: formData.get("orderingEnabled") === "on",
    accepts_tuesday: formData.get("acceptsTuesday") === "on",
    accepts_saturday: formData.get("acceptsSaturday") === "on",
    order_cutoff_hours: Math.max(1, Math.min(168, Number(formData.get("orderCutoffHours") ?? 24))),
    updated_at: new Date().toISOString(), updated_by: user.id,
  }).eq("id", access.shopId);
  revalidatePath("/platform/shop", "layout");
  redirect("/platform/shop/settings?saved=1");
}

export async function updateVendorProduct(formData: FormData) {
  const access = await requireShopAccess();
  const id = String(formData.get("productId") ?? "");
  const { data } = await supabaseAdmin.from("exhibition_items").select("id").eq("id",id).eq("shop_id",access.shopId).maybeSingle();
  if (!data) redirect("/platform/shop/products");
  const status = String(formData.get("status") ?? "preparing");
  const published = formData.get("published") === "on" && status !== "preparing";
  await supabaseAdmin.from("exhibition_items").update({quantity:Math.max(0,Number(formData.get("quantity")??0)),status,published,published_at:published?new Date().toISOString():null,updated_at:new Date().toISOString(),updated_by:access.userId}).eq("id",id).eq("shop_id",access.shopId);
  revalidatePath("/platform/shop/products");
}

export async function createVendorProduct(formData: FormData) {
  const access = await requireShopAccess();
  const name = String(formData.get("productName") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const intent = String(formData.get("intent") ?? "draft");
  const irisu = Number(formData.get("irisu") ?? 1);
  const price = Number(formData.get("price") ?? 0);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const errors = publicationErrors({ name, category, irisu, price });
  if (intent === "publish" && errors.length) {
    redirect(`/platform/shop/products/new?error=${encodeURIComponent(`${errors.join("・")}を入力してください。`)}`);
  }
  const { data: latest } = await supabaseAdmin.from("exhibition_items").select("item_no").eq("shop_id", access.shopId).order("item_no", { ascending: false }).limit(1).maybeSingle();
  const quantity = Math.max(0, Number(formData.get("quantity") ?? 0));
  const published = intent === "publish";
  const { data: created } = await supabaseAdmin.from("exhibition_items").insert({ shop_id: access.shopId, item_no: Number(latest?.item_no ?? 0) + 1, product_name: name || null, category: category || null, tree_height: String(formData.get("treeHeight") ?? "") || null, tree_shape: String(formData.get("treeShape") ?? "") || null, pot_size: String(formData.get("potSize") ?? "") || null, irisu: Number.isInteger(irisu) && irisu > 0 ? irisu : 1, units_per_sales_unit: Number.isInteger(irisu) && irisu > 0 ? irisu : 1, sales_unit: "case", quantity, price: Number.isFinite(price) && price >= 0 ? price : 0, status: published ? (quantity > 0 ? "selling" : "sold") : "preparing", published, published_at: published ? new Date().toISOString() : null, input_completed: published, created_by: access.userId, updated_by: access.userId }).select("id").single();
  if (created && imageUrl) await supabaseAdmin.from("exhibition_images").insert({ item_id: created.id, image_url: imageUrl, sort_order: 0 });
  revalidatePath("/platform/shop/products");
  redirect("/platform/shop/products");
}

function publicationErrors(input: {
  name: string;
  category: string;
  irisu: number;
  price: number;
}) {
  const errors: string[] = [];
  if (!input.name) errors.push("商品名");
  if (!input.category) errors.push("カテゴリー");
  if (!Number.isInteger(input.irisu) || input.irisu < 1) errors.push("ケース入数");
  if (!Number.isFinite(input.price) || input.price <= 0) errors.push("税抜価格（1円以上）");
  return errors;
}

export async function saveVendorProductDetails(formData: FormData) {
  const access = await requireShopAccess();
  const productId = String(formData.get("productId") ?? "");
  const { data: product } = await supabaseAdmin
    .from("exhibition_items")
    .select("id,shop_id,published_at,exhibition_images(id)")
    .eq("id", productId)
    .eq("shop_id", access.shopId)
    .maybeSingle();
  if (!product) redirect("/platform/shop/products");

  const intent = String(formData.get("intent") ?? "draft");
  const name = String(formData.get("productName") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const irisu = Number(formData.get("irisu") ?? 1);
  const price = Number(formData.get("price") ?? 0);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const currentImages = Array.isArray(product.exhibition_images) ? product.exhibition_images : [];
  const errors = publicationErrors({ name, category, irisu, price });
  if (intent === "publish" && errors.length) {
    redirect(`/platform/shop/products/${productId}?error=${encodeURIComponent(`${errors.join("・")}を入力してください。`)}`);
  }

  const quantity = Math.max(0, Number(formData.get("quantity") ?? 0));
  const published = intent === "publish";
  await supabaseAdmin.from("exhibition_items").update({
    product_name: name || null,
    category: category || null,
    tree_height: String(formData.get("treeHeight") ?? "").trim() || null,
    tree_shape: String(formData.get("treeShape") ?? "").trim() || null,
    pot_size: String(formData.get("potSize") ?? "").trim() || null,
    irisu: Number.isInteger(irisu) && irisu > 0 ? irisu : 1,
    units_per_sales_unit: Number.isInteger(irisu) && irisu > 0 ? irisu : 1,
    quantity,
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    status: published ? (quantity > 0 ? "selling" : "sold") : "preparing",
    published,
    published_at: published ? product.published_at ?? new Date().toISOString() : null,
    input_completed: published,
    updated_at: new Date().toISOString(),
    updated_by: access.userId,
  }).eq("id", productId).eq("shop_id", access.shopId);

  if (imageUrl && currentImages.length === 0) {
    await supabaseAdmin.from("exhibition_images").insert({ item_id: Number(productId), image_url: imageUrl, sort_order: 0 });
  }
  revalidatePath("/platform/shop/products");
  revalidatePath(`/platform/shop/products/${productId}`);
  revalidatePath(`/platform/products/${productId}`);
  redirect(`/platform/shop/products/${productId}?saved=${published ? "published" : "draft"}`);
}
