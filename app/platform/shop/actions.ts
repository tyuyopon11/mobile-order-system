"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_SHOP_COOKIE, canManageShop, requireShopAccess } from "@/lib/auth/shop-access";
import { getPlatformAccess, isApprovedPlatformAdmin } from "@/lib/auth/platform-user";
import { isProductCategory } from "@/lib/products/categories";
import { uploadProductImage } from "@/lib/products/images";
import { getProductPublicationErrors } from "@/lib/products/publication";
import { parseProductSalesPeriod, validateProductSalesPeriod } from "@/lib/products/sales-period";
import { parseProductReservationPeriod, validateProductReservationPeriod } from "@/lib/products/reservation-period";
import { saveShopLogo } from "@/lib/shops/images";
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
  const { error } = await supabaseAdmin.from("shops").update({
    short_description: String(formData.get("shortDescription") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    announcement: String(formData.get("announcement") ?? "").trim() || null,
    ordering_enabled: formData.get("orderingEnabled") === "on",
    accepts_tuesday: formData.get("acceptsTuesday") === "on",
    accepts_saturday: formData.get("acceptsSaturday") === "on",
    order_cutoff_hours: Math.max(1, Math.min(168, Number(formData.get("orderCutoffHours") ?? 24))),
    updated_at: new Date().toISOString(), updated_by: user.id,
  }).eq("id", access.shopId);
  if (error) redirect("/platform/shop/settings?error=ショップ設定を保存できませんでした。");
  const logoFile = formData.get("logoFile");
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      await saveShopLogo(access.shopId, logoFile, user.id);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "ロゴ画像を保存できませんでした。";
      redirect(`/platform/shop/settings?error=${encodeURIComponent(`設定は保存しましたが、${message}`)}`);
    }
  }
  revalidatePath("/platform/shop", "layout");
  revalidatePath("/platform");
  revalidatePath(`/platform/shops/${access.slug}`);
  redirect("/platform/shop/settings?saved=1");
}

export async function createVendorProduct(formData: FormData) {
  const access = await requireShopAccess();
  const name = String(formData.get("productName") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const intent = String(formData.get("intent") ?? "draft");
  const irisu = Number(formData.get("irisu") ?? 1);
  const price = Number(formData.get("price") ?? 0);
  const imageFile = formData.get("imageFile");
  const salesPeriod = {
    ...parseProductSalesPeriod(formData),
    ...parseProductReservationPeriod(formData),
    pickup_comment: String(formData.get("pickupComment") ?? "").trim() || null,
  };
  const salesPeriodError = validateProductSalesPeriod(salesPeriod);
  const reservationPeriodError = validateProductReservationPeriod(salesPeriod);
  if (reservationPeriodError) redirect(`/platform/shop/products/new?error=${encodeURIComponent(reservationPeriodError)}`);
  if (salesPeriod.pickup_comment && salesPeriod.pickup_comment.length > 500) redirect("/platform/shop/products/new?error=先取りコメントは500文字以内で入力してください。");
  if (salesPeriodError) redirect(`/platform/shop/products/new?error=${encodeURIComponent(salesPeriodError)}`);
  if (category && !isProductCategory(category)) {
    redirect("/platform/shop/products/new?error=カテゴリーは一覧から選択してください。");
  }
  const errors = getProductPublicationErrors({ name, category, irisu, price });
  if (intent === "publish" && errors.length) {
    redirect(`/platform/shop/products/new?error=${encodeURIComponent(`${errors.join("・")}を確認してください。`)}`);
  }
  const { data: latest } = await supabaseAdmin.from("exhibition_items").select("item_no").eq("shop_id", access.shopId).order("item_no", { ascending: false }).limit(1).maybeSingle();
  const quantity = Math.max(0, Number(formData.get("quantity") ?? 0));
  const published = intent === "publish";
  const { data: created, error: createError } = await supabaseAdmin.from("exhibition_items").insert({ ...salesPeriod, shop_id: access.shopId, item_no: Number(latest?.item_no ?? 0) + 1, product_name: name || null, category: category || null, tree_height: String(formData.get("treeHeight") ?? "").trim() || null, tree_shape: String(formData.get("treeShape") ?? "").trim() || null, pot_size: String(formData.get("potSize") ?? "").trim() || null, irisu: Number.isInteger(irisu) && irisu > 0 ? irisu : 1, units_per_sales_unit: Number.isInteger(irisu) && irisu > 0 ? irisu : 1, sales_unit: "case", quantity, price: Number.isFinite(price) && price >= 0 ? price : 0, status: published ? (quantity > 0 ? "selling" : "sold") : "preparing", published, published_at: published ? new Date().toISOString() : null, input_completed: published, created_by: access.userId, updated_by: access.userId }).select("id").single();
  if (createError || !created) {
    redirect("/platform/shop/products/new?error=商品を保存できませんでした。もう一度お試しください。");
  }
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      await uploadProductImage(Number(created.id), imageFile, { makePrimary: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "商品画像を登録できませんでした。";
      redirect(`/platform/shop/products/${created.id}?error=${encodeURIComponent(`商品は保存しましたが、${message}`)}`);
    }
  }
  revalidatePath("/platform/shop/products");
  revalidatePath(`/platform/shops/${access.slug}`);
  redirect(`/platform/shop/products?created=${created.id}`);
}

export async function saveVendorProductDetails(formData: FormData) {
  const access = await requireShopAccess();
  const productId = String(formData.get("productId") ?? "");
  const { data: product } = await supabaseAdmin
    .from("exhibition_items")
    .select("id,shop_id,category,published_at")
    .eq("id", productId)
    .eq("shop_id", access.shopId)
    .maybeSingle();
  if (!product) redirect("/platform/shop/products");

  const intent = String(formData.get("intent") ?? "draft");
  const name = String(formData.get("productName") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const irisu = Number(formData.get("irisu") ?? 1);
  const price = Number(formData.get("price") ?? 0);
  const imageFile = formData.get("imageFile");
  const salesPeriod = {
    ...parseProductSalesPeriod(formData),
    ...parseProductReservationPeriod(formData),
    pickup_comment: String(formData.get("pickupComment") ?? "").trim() || null,
  };
  const salesPeriodError = validateProductSalesPeriod(salesPeriod);
  const reservationPeriodError = validateProductReservationPeriod(salesPeriod);
  if (reservationPeriodError) redirect(`/platform/shop/products/${productId}?error=${encodeURIComponent(reservationPeriodError)}`);
  if (salesPeriod.pickup_comment && salesPeriod.pickup_comment.length > 500) redirect(`/platform/shop/products/${productId}?error=${encodeURIComponent("先取りコメントは500文字以内で入力してください。")}`);
  if (salesPeriodError) redirect(`/platform/shop/products/${productId}?error=${encodeURIComponent(salesPeriodError)}`);
  if (category && !isProductCategory(category) && category !== product.category) {
    redirect(`/platform/shop/products/${productId}?error=${encodeURIComponent("カテゴリーは一覧から選択してください。")}`);
  }
  const errors = getProductPublicationErrors({ name, category, irisu, price });
  if (intent === "publish" && errors.length) {
    redirect(`/platform/shop/products/${productId}?error=${encodeURIComponent(`${errors.join("・")}を確認してください。`)}`);
  }

  const quantity = Math.max(0, Number(formData.get("quantity") ?? 0));
  const published = intent === "publish";
  const { error: updateError } = await supabaseAdmin.from("exhibition_items").update({
    ...salesPeriod,
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
  if (updateError) {
    redirect(`/platform/shop/products/${productId}?error=${encodeURIComponent("商品を保存できませんでした。もう一度お試しください。")}`);
  }
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      await uploadProductImage(Number(productId), imageFile, { makePrimary: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "商品画像を登録できませんでした。";
      redirect(`/platform/shop/products/${productId}?error=${encodeURIComponent(`商品情報は保存しましたが、${message}`)}`);
    }
  }
  revalidatePath("/platform/shop/products");
  revalidatePath(`/platform/shop/products/${productId}`);
  revalidatePath(`/platform/products/${productId}`);
  revalidatePath(`/platform/shops/${access.slug}`);
  redirect(`/platform/shop/products/${productId}?saved=${published ? "published" : "draft"}`);
}

export async function setVendorProductPublished(formData: FormData) {
  const access = await requireShopAccess();
  const productId = String(formData.get("productId") ?? "");
  const publish = String(formData.get("publish") ?? "false") === "true";
  const { data: product, error: productError } = await supabaseAdmin
    .from("exhibition_items")
    .select("id,product_name,category,irisu,price,quantity,published_at")
    .eq("id", productId)
    .eq("shop_id", access.shopId)
    .maybeSingle();
  if (productError || !product) redirect("/platform/shop/products?error=商品を確認できませんでした。");

  if (publish) {
    const errors = getProductPublicationErrors({
      name: product.product_name,
      category: product.category,
      irisu: Number(product.irisu),
      price: Number(product.price),
    });
    if (errors.length) {
      redirect(`/platform/shop/products?error=${encodeURIComponent(`${errors.join("・")}を確認してから公開してください。`)}`);
    }
  }

  const now = new Date().toISOString();
  const quantity = Math.max(0, Number(product.quantity ?? 0));
  const { error } = await supabaseAdmin
    .from("exhibition_items")
    .update({
      published: publish,
      published_at: publish ? product.published_at ?? now : null,
      input_completed: publish,
      status: publish ? (quantity > 0 ? "selling" : "sold") : "preparing",
      updated_at: now,
      updated_by: access.userId,
    })
    .eq("id", productId)
    .eq("shop_id", access.shopId);
  if (error) redirect("/platform/shop/products?error=公開状態を更新できませんでした。");

  revalidatePath("/platform/shop/products");
  revalidatePath(`/platform/shop/products/${productId}`);
  revalidatePath(`/platform/products/${productId}`);
  revalidatePath(`/platform/shops/${access.slug}`);
  revalidatePath("/platform");
  redirect(`/platform/shop/products?updated=${publish ? "published" : "unpublished"}`);
}
