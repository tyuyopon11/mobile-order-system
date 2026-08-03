"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isProductCategory } from "@/lib/products/categories";
import {
  isSalesUnit,
} from "@/lib/products/sales-unit";

export type ProductFieldErrors = Partial<
  Record<
    | "shopId"
    | "itemNo"
    | "productName"
    | "category"
    | "quantity"
    | "price"
    | "salesUnit"
    | "unitsPerSalesUnit"
    | "status",
    string
  >
>;

export type ProductActionState = {
  success: boolean;
  message: string | null;
  fieldErrors: ProductFieldErrors;
};

const PRODUCT_STATUSES = new Set(["preparing", "selling", "sold"]);

function optionalText(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

function optionalNumber(
  formData: FormData,
  name: string
): number | null {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? null : Number(value);
}

export async function createProduct(
  _previousState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access) || !access.platformUser) {
    return {
      success: false,
      message: "この操作を行う権限がありません。",
      fieldErrors: {},
    };
  }

  const shopId = String(formData.get("shopId") ?? "").trim();
  const itemNoText = String(formData.get("itemNo") ?? "").trim();
  const productName = String(formData.get("productName") ?? "").trim();
  const category = optionalText(formData, "category");
  const item = optionalText(formData, "item");
  const variety = optionalText(formData, "variety");
  const spec = optionalText(formData, "spec");
  const treeHeight = optionalText(formData, "treeHeight");
  const treeShape = optionalText(formData, "treeShape");
  const potSize = optionalText(formData, "potSize");
  const origin = optionalText(formData, "origin");
  const producer = optionalText(formData, "producer");
  const staff = optionalText(formData, "staff");
  const comment = optionalText(formData, "comment");
  const jfCode = optionalText(formData, "jfCode");
  const quantity = optionalNumber(formData, "quantity");
  const price = optionalNumber(formData, "price");
  const salesUnit = "case";
  const unitsPerSalesUnit = optionalNumber(
    formData,
    "unitsPerSalesUnit"
  );
  const status = String(formData.get("status") ?? "preparing");
  const published = formData.get("published") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const fieldErrors: ProductFieldErrors = {};
  let itemNo = itemNoText === "" ? null : Number(itemNoText);

  if (!shopId) {
    fieldErrors.shopId = "ショップを選択してください。";
  }

  if (!productName) {
    fieldErrors.productName = "商品名を入力してください。";
  } else if (productName.length > 300) {
    fieldErrors.productName = "商品名は300文字以内で入力してください。";
  }

  if (category !== null && !isProductCategory(category)) {
    fieldErrors.category = "カテゴリーは一覧から選択してください。";
  }
  if (published && !isProductCategory(category)) {
    fieldErrors.category = "公開する商品はカテゴリーを選択してください。";
  }

  if (
    itemNo !== null &&
    (!Number.isInteger(itemNo) || itemNo <= 0 || itemNo > 999999)
  ) {
    fieldErrors.itemNo =
      "商品番号は1〜999999の整数で入力するか、空欄にしてください。";
  }

  if (
    quantity !== null &&
    (!Number.isInteger(quantity) || quantity < 0)
  ) {
    fieldErrors.quantity = "数量は0以上の整数で入力してください。";
  }

  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    fieldErrors.price = "価格は0以上の数値で入力してください。";
  }

  if (!isSalesUnit(salesUnit)) {
    fieldErrors.salesUnit = "販売単位を選択してください。";
  }

  if (
    unitsPerSalesUnit === null ||
    !Number.isInteger(unitsPerSalesUnit) ||
    unitsPerSalesUnit < 1
  ) {
    fieldErrors.unitsPerSalesUnit =
      "入数は1以上の整数で入力してください。";
  }

  if (!PRODUCT_STATUSES.has(status)) {
    fieldErrors.status = "販売状態を選択してください。";
  } else if (published && status === "preparing") {
    fieldErrors.status =
      "公開する商品は「販売中」または「売約済み」を選択してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      fieldErrors,
    };
  }

  const { data: shop, error: shopError } = await supabaseAdmin
    .from("shops")
    .select("id,slug")
    .eq("id", shopId)
    .maybeSingle();

  if (shopError || !shop) {
    return {
      success: false,
      message: "選択したショップを確認できませんでした。",
      fieldErrors: {
        shopId: "ショップを選び直してください。",
      },
    };
  }

  if (itemNo === null) {
    const { data: latestItem, error: latestItemError } = await supabaseAdmin
      .from("exhibition_items")
      .select("item_no")
      .eq("shop_id", shopId)
      .order("item_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestItemError) {
      console.error(
        "[Lei Port Admin] Failed to create item number:",
        latestItemError.message
      );
      return {
        success: false,
        message: "商品番号を自動採番できませんでした。",
        fieldErrors: {},
      };
    }

    itemNo = Number(latestItem?.item_no ?? 0) + 1;
  }

  const now = new Date().toISOString();
  const { data: createdProduct, error } = await supabaseAdmin
    .from("exhibition_items")
    .insert({
      shop_id: shopId,
      item_no: itemNo,
      product_name: productName,
      category,
      item,
      variety,
      spec,
      tree_height: treeHeight,
      tree_shape: treeShape,
      pot_size: potSize,
      quantity,
      price,
      irisu: unitsPerSalesUnit,
      sales_unit: salesUnit,
      units_per_sales_unit: unitsPerSalesUnit,
      origin,
      producer,
      staff,
      comment,
      jf_code: jfCode,
      status,
      input_completed: false,
      published,
      published_at: published ? now : null,
      is_featured: isFeatured,
      display_order: itemNo,
      created_by: access.platformUser.id,
      updated_by: access.platformUser.id,
    })
    .select("id")
    .single();

  if (error || !createdProduct) {
    console.error(
      "[Lei Port Admin] Failed to create product:",
      error?.message ?? "Product not returned"
    );
    return {
      success: false,
      message: "商品を登録できませんでした。もう一度お試しください。",
      fieldErrors: {},
    };
  }

  revalidatePath("/platform/admin/products");
  revalidatePath(`/platform/shops/${shop.slug}`);
  redirect(`/platform/admin/products?created=${createdProduct.id}`);
}

export async function updateProduct(
  _previousState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access) || !access.platformUser) {
    return {
      success: false,
      message: "この操作を行う権限がありません。",
      fieldErrors: {},
    };
  }

  const productId = String(formData.get("productId") ?? "").trim();
  const shopId = String(formData.get("shopId") ?? "").trim();
  const itemNo = Number(String(formData.get("itemNo") ?? "").trim());
  const productName = String(formData.get("productName") ?? "").trim();
  const category = optionalText(formData, "category");
  const item = optionalText(formData, "item");
  const variety = optionalText(formData, "variety");
  const spec = optionalText(formData, "spec");
  const treeHeight = optionalText(formData, "treeHeight");
  const treeShape = optionalText(formData, "treeShape");
  const potSize = optionalText(formData, "potSize");
  const origin = optionalText(formData, "origin");
  const producer = optionalText(formData, "producer");
  const staff = optionalText(formData, "staff");
  const comment = optionalText(formData, "comment");
  const jfCode = optionalText(formData, "jfCode");
  const quantity = optionalNumber(formData, "quantity");
  const price = optionalNumber(formData, "price");
  const salesUnit = "case";
  const unitsPerSalesUnit = optionalNumber(
    formData,
    "unitsPerSalesUnit"
  );
  const status = String(formData.get("status") ?? "preparing");
  const published = formData.get("published") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const fieldErrors: ProductFieldErrors = {};

  if (!productId) {
    return {
      success: false,
      message: "更新する商品を特定できませんでした。",
      fieldErrors: {},
    };
  }

  const { data: existingProduct } = await supabaseAdmin
    .from("exhibition_items")
    .select("category")
    .eq("id", productId)
    .maybeSingle();

  if (!shopId) {
    fieldErrors.shopId = "ショップを選択してください。";
  }

  if (!productName) {
    fieldErrors.productName = "商品名を入力してください。";
  } else if (productName.length > 300) {
    fieldErrors.productName = "商品名は300文字以内で入力してください。";
  }

  if (
    category !== null &&
    !isProductCategory(category) &&
    category !== existingProduct?.category
  ) {
    fieldErrors.category = "カテゴリーは一覧から選択してください。";
  }
  if (published && !isProductCategory(category)) {
    fieldErrors.category = "公開する商品はカテゴリーを選択してください。";
  }

  if (!Number.isInteger(itemNo) || itemNo <= 0 || itemNo > 999999) {
    fieldErrors.itemNo = "商品番号は1〜999999の整数で入力してください。";
  }

  if (
    quantity !== null &&
    (!Number.isInteger(quantity) || quantity < 0)
  ) {
    fieldErrors.quantity = "数量は0以上の整数で入力してください。";
  }

  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    fieldErrors.price = "価格は0以上の数値で入力してください。";
  }

  if (!isSalesUnit(salesUnit)) {
    fieldErrors.salesUnit = "販売単位を選択してください。";
  }

  if (
    unitsPerSalesUnit === null ||
    !Number.isInteger(unitsPerSalesUnit) ||
    unitsPerSalesUnit < 1
  ) {
    fieldErrors.unitsPerSalesUnit =
      "入数は1以上の整数で入力してください。";
  }

  if (!PRODUCT_STATUSES.has(status)) {
    fieldErrors.status = "販売状態を選択してください。";
  } else if (published && status === "preparing") {
    fieldErrors.status =
      "公開する商品は「販売中」または「売約済み」を選択してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      fieldErrors,
    };
  }

  const { data: currentProduct, error: currentProductError } =
    await supabaseAdmin
      .from("exhibition_items")
      .select("id,shop_id,published,published_at,shops(slug)")
      .eq("id", productId)
      .maybeSingle();

  if (currentProductError || !currentProduct) {
    return {
      success: false,
      message: "更新する商品を取得できませんでした。",
      fieldErrors: {},
    };
  }

  const { data: selectedShop, error: selectedShopError } =
    await supabaseAdmin
      .from("shops")
      .select("id,slug")
      .eq("id", shopId)
      .maybeSingle();

  if (selectedShopError || !selectedShop) {
    return {
      success: false,
      message: "選択したショップを確認できませんでした。",
      fieldErrors: {
        shopId: "ショップを選び直してください。",
      },
    };
  }

  const now = new Date().toISOString();
  const publishedAt = published
    ? currentProduct.published_at ?? now
    : null;
  const { error } = await supabaseAdmin
    .from("exhibition_items")
    .update({
      shop_id: shopId,
      item_no: itemNo,
      product_name: productName,
      category,
      item,
      variety,
      spec,
      tree_height: treeHeight,
      tree_shape: treeShape,
      pot_size: potSize,
      quantity,
      price,
      irisu: unitsPerSalesUnit,
      sales_unit: salesUnit,
      units_per_sales_unit: unitsPerSalesUnit,
      origin,
      producer,
      staff,
      comment,
      jf_code: jfCode,
      status,
      published,
      published_at: publishedAt,
      is_featured: isFeatured,
      display_order: itemNo,
      updated_at: now,
      updated_by: access.platformUser.id,
    })
    .eq("id", productId);

  if (error) {
    console.error("[Lei Port Admin] Failed to update product:", error.message);
    return {
      success: false,
      message: "商品を更新できませんでした。もう一度お試しください。",
      fieldErrors: {},
    };
  }

  const rawCurrentShop = currentProduct.shops as unknown as
    | { slug: string }
    | { slug: string }[]
    | null;
  const currentShop = Array.isArray(rawCurrentShop)
    ? rawCurrentShop[0]
    : rawCurrentShop;

  revalidatePath("/platform/admin/products");
  revalidatePath(`/platform/admin/products/${productId}`);
  revalidatePath(`/platform/products/${productId}`);
  revalidatePath(`/platform/shops/${selectedShop.slug}`);
  if (currentShop?.slug && currentShop.slug !== selectedShop.slug) {
    revalidatePath(`/platform/shops/${currentShop.slug}`);
  }
  redirect(`/platform/admin/products?updated=${productId}`);
}

async function getAdminAndProduct(productId: string) {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access) || !access.platformUser) {
    return {
      error: "この操作を行う権限がありません。",
      admin: null,
      product: null,
    };
  }

  const { data: product, error } = await supabaseAdmin
    .from("exhibition_items")
    .select("id,status,published,published_at,shops(slug)")
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) {
    return {
      error: "商品情報を取得できませんでした。",
      admin: null,
      product: null,
    };
  }

  return {
    error: null,
    admin: access.platformUser,
    product,
  };
}

function getProductShopSlug(
  shops: unknown
): string | null {
  const value = shops as
    | { slug: string }
    | { slug: string }[]
    | null;
  const shop = Array.isArray(value) ? value[0] : value;
  return shop?.slug ?? null;
}

function revalidateProductPaths(
  productId: string,
  shopSlug: string | null
) {
  revalidatePath("/platform/admin/products");
  revalidatePath(`/platform/admin/products/${productId}`);
  revalidatePath(`/platform/products/${productId}`);
  if (shopSlug) revalidatePath(`/platform/shops/${shopSlug}`);
}

export async function setProductPublished(
  productId: string,
  published: boolean
): Promise<{ ok: boolean; message: string }> {
  const result = await getAdminAndProduct(productId);

  if (result.error || !result.admin || !result.product) {
    return {
      ok: false,
      message: result.error ?? "商品を更新できませんでした。",
    };
  }

  if (published && result.product.status === "preparing") {
    return {
      ok: false,
      message: "準備中の商品は公開できません。先に販売状態を変更してください。",
    };
  }

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("exhibition_items")
    .update({
      published,
      published_at: published
        ? result.product.published_at ?? now
        : null,
      updated_at: now,
      updated_by: result.admin.id,
    })
    .eq("id", productId);

  if (error) {
    return { ok: false, message: "公開状態を更新できませんでした。" };
  }

  revalidateProductPaths(
    productId,
    getProductShopSlug(result.product.shops)
  );
  return {
    ok: true,
    message: published ? "商品を公開しました。" : "商品を非公開にしました。",
  };
}

export async function setProductFeatured(
  productId: string,
  isFeatured: boolean
): Promise<{ ok: boolean; message: string }> {
  const result = await getAdminAndProduct(productId);

  if (result.error || !result.admin || !result.product) {
    return {
      ok: false,
      message: result.error ?? "商品を更新できませんでした。",
    };
  }

  const { error } = await supabaseAdmin
    .from("exhibition_items")
    .update({
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
      updated_by: result.admin.id,
    })
    .eq("id", productId);

  if (error) {
    return { ok: false, message: "おすすめ設定を更新できませんでした。" };
  }

  revalidateProductPaths(
    productId,
    getProductShopSlug(result.product.shops)
  );
  return {
    ok: true,
    message: isFeatured
      ? "おすすめ商品に設定しました。"
      : "おすすめ設定を解除しました。",
  };
}

export async function setProductStatus(
  productId: string,
  status: string
): Promise<{ ok: boolean; message: string }> {
  if (!PRODUCT_STATUSES.has(status)) {
    return { ok: false, message: "販売状態が正しくありません。" };
  }

  const result = await getAdminAndProduct(productId);

  if (result.error || !result.admin || !result.product) {
    return {
      ok: false,
      message: result.error ?? "商品を更新できませんでした。",
    };
  }

  const now = new Date().toISOString();
  const preparing = status === "preparing";
  const updates: Record<string, string | boolean | null> = {
    status,
    updated_at: now,
    updated_by: result.admin.id,
  };

  if (preparing) {
    updates.published = false;
    updates.published_at = null;
  }

  const { error } = await supabaseAdmin
    .from("exhibition_items")
    .update(updates)
    .eq("id", productId);

  if (error) {
    return { ok: false, message: "販売状態を更新できませんでした。" };
  }

  revalidateProductPaths(
    productId,
    getProductShopSlug(result.product.shops)
  );
  return {
    ok: true,
    message: preparing
      ? "準備中へ変更し、商品を非公開にしました。"
      : "販売状態を更新しました。",
  };
}
