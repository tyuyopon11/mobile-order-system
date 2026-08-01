"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { createClient } from "@/lib/supabase/server";

type ShopBooleanField = "published" | "is_featured";

export type ShopActionState = {
  ok: boolean;
  message: string;
};

export type CreateShopFieldErrors = Partial<
  Record<
    | "shopName"
    | "slug"
    | "shortDescription"
    | "description"
    | "shopType"
    | "displayOrder"
    | "contactEmail"
    | "phone"
    | "address"
    | "websiteUrl"
    | "instagramUrl",
    string
  >
>;

export type CreateShopState = {
  success: boolean;
  message: string | null;
  fieldErrors: CreateShopFieldErrors;
};

const SHOP_TYPES = new Set([
  "market",
  "plant_shop",
  "producer",
  "vendor",
  "corporate",
  "brand",
  "exhibition",
  "official",
]);

function optionalValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

function isValidOptionalUrl(value: string | null) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createShop(
  _previousState: CreateShopState,
  formData: FormData
): Promise<CreateShopState> {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access) || !access.platformUser) {
    return {
      success: false,
      message: "この操作を行う権限がありません。",
      fieldErrors: {},
    };
  }

  const shopName = String(formData.get("shopName") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const shortDescription = optionalValue(formData, "shortDescription");
  const description = optionalValue(formData, "description");
  const shopType = String(formData.get("shopType") ?? "").trim();
  const contactEmail = optionalValue(formData, "contactEmail");
  const announcement = optionalValue(formData, "announcement");
  const orderingEnabled = formData.get("orderingEnabled") === "on";
  const acceptsTuesday = formData.get("acceptsTuesday") === "on";
  const acceptsSaturday = formData.get("acceptsSaturday") === "on";
  const orderCutoffHours = Math.max(
    1,
    Number(formData.get("orderCutoffHours") ?? 24)
  );
  const phone = optionalValue(formData, "phone");
  const address = optionalValue(formData, "address");
  const websiteUrl = optionalValue(formData, "websiteUrl");
  const instagramUrl = optionalValue(formData, "instagramUrl");
  const displayOrderText = String(formData.get("displayOrder") ?? "0").trim();
  const displayOrder = Number(displayOrderText);
  const published = formData.get("published") === "on";
  const showOnPublicSite = formData.get("showOnPublicSite") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const fieldErrors: CreateShopFieldErrors = {};

  if (!shopName) {
    fieldErrors.shopName = "ショップ名を入力してください。";
  } else if (shopName.length > 200) {
    fieldErrors.shopName = "ショップ名は200文字以内で入力してください。";
  }

  if (!slug) {
    fieldErrors.slug = "slugを入力してください。";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fieldErrors.slug =
      "slugは半角英数字とハイフンで入力してください（例: takashimaya-plants）。";
  } else if (slug.length > 100) {
    fieldErrors.slug = "slugは100文字以内で入力してください。";
  }

  if (!SHOP_TYPES.has(shopType)) {
    fieldErrors.shopType = "ショップ種別を選択してください。";
  }

  if (
    !displayOrderText ||
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    displayOrder > 9999
  ) {
    fieldErrors.displayOrder = "表示順は0〜9999の整数で入力してください。";
  }

  if (shortDescription && shortDescription.length > 200) {
    fieldErrors.shortDescription =
      "短い紹介文は200文字以内で入力してください。";
  }

  if (description && description.length > 5000) {
    fieldErrors.description = "説明文は5000文字以内で入力してください。";
  }

  if (
    contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
  ) {
    fieldErrors.contactEmail =
      "メールアドレスの形式を確認してください。";
  }

  if (phone && phone.length > 30) {
    fieldErrors.phone = "電話番号は30文字以内で入力してください。";
  }

  if (!isValidOptionalUrl(websiteUrl)) {
    fieldErrors.websiteUrl =
      "https:// または http:// から始まるURLを入力してください。";
  }

  if (!isValidOptionalUrl(instagramUrl)) {
    fieldErrors.instagramUrl =
      "https:// または http:// から始まるURLを入力してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("shops").insert({
    shop_name: shopName,
    slug,
    short_description: shortDescription,
    description,
    shop_type: shopType,
    contact_email: contactEmail,
    announcement,
    ordering_enabled: orderingEnabled,
    accepts_tuesday: acceptsTuesday,
    accepts_saturday: acceptsSaturday,
    order_cutoff_hours: orderCutoffHours,
    phone,
    address,
    website_url: websiteUrl,
    instagram_url: instagramUrl,
    display_order: displayOrder,
    published,
    published_at: published ? now : null,
    show_on_public_site: showOnPublicSite,
    is_featured: isFeatured,
    updated_by: access.platformUser.id,
  });

  if (error) {
    console.error("[Lei Port Admin] Failed to create shop:", error.message);

    if (error.code === "23505") {
      return {
        success: false,
        message: "同じslugのショップがすでに登録されています。",
        fieldErrors: {
          slug: "別のslugを入力してください。",
        },
      };
    }

    return {
      success: false,
      message: "ショップを登録できませんでした。もう一度お試しください。",
      fieldErrors: {},
    };
  }

  revalidatePath("/platform");
  revalidatePath("/platform/admin/shops");
  redirect("/platform/admin/shops?created=1");
}

export async function updateShop(
  _previousState: CreateShopState,
  formData: FormData
): Promise<CreateShopState> {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access) || !access.platformUser) {
    return {
      success: false,
      message: "この操作を行う権限がありません。",
      fieldErrors: {},
    };
  }

  const shopId = String(formData.get("shopId") ?? "").trim();
  const shopName = String(formData.get("shopName") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const shortDescription = optionalValue(formData, "shortDescription");
  const description = optionalValue(formData, "description");
  const shopType = String(formData.get("shopType") ?? "").trim();
  const contactEmail = optionalValue(formData, "contactEmail");
  const announcement = optionalValue(formData, "announcement");
  const orderingEnabled = formData.get("orderingEnabled") === "on";
  const acceptsTuesday = formData.get("acceptsTuesday") === "on";
  const acceptsSaturday = formData.get("acceptsSaturday") === "on";
  const orderCutoffHours = Math.max(
    1,
    Number(formData.get("orderCutoffHours") ?? 24)
  );
  const phone = optionalValue(formData, "phone");
  const address = optionalValue(formData, "address");
  const websiteUrl = optionalValue(formData, "websiteUrl");
  const instagramUrl = optionalValue(formData, "instagramUrl");
  const displayOrderText = String(formData.get("displayOrder") ?? "0").trim();
  const displayOrder = Number(displayOrderText);
  const published = formData.get("published") === "on";
  const showOnPublicSite = formData.get("showOnPublicSite") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const fieldErrors: CreateShopFieldErrors = {};

  if (!shopId) {
    return {
      success: false,
      message: "更新するショップを特定できませんでした。",
      fieldErrors: {},
    };
  }

  if (!shopName) {
    fieldErrors.shopName = "ショップ名を入力してください。";
  } else if (shopName.length > 200) {
    fieldErrors.shopName = "ショップ名は200文字以内で入力してください。";
  }

  if (!slug) {
    fieldErrors.slug = "slugを入力してください。";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fieldErrors.slug =
      "slugは半角英数字とハイフンで入力してください。";
  } else if (slug.length > 100) {
    fieldErrors.slug = "slugは100文字以内で入力してください。";
  }

  if (!SHOP_TYPES.has(shopType)) {
    fieldErrors.shopType = "ショップ種別を選択してください。";
  }

  if (
    !displayOrderText ||
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    displayOrder > 9999
  ) {
    fieldErrors.displayOrder = "表示順は0〜9999の整数で入力してください。";
  }

  if (shortDescription && shortDescription.length > 200) {
    fieldErrors.shortDescription =
      "短い紹介文は200文字以内で入力してください。";
  }

  if (description && description.length > 5000) {
    fieldErrors.description = "説明文は5000文字以内で入力してください。";
  }

  if (
    contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
  ) {
    fieldErrors.contactEmail =
      "メールアドレスの形式を確認してください。";
  }

  if (phone && phone.length > 30) {
    fieldErrors.phone = "電話番号は30文字以内で入力してください。";
  }

  if (!isValidOptionalUrl(websiteUrl)) {
    fieldErrors.websiteUrl =
      "https:// または http:// から始まるURLを入力してください。";
  }

  if (!isValidOptionalUrl(instagramUrl)) {
    fieldErrors.instagramUrl =
      "https:// または http:// から始まるURLを入力してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: currentShop, error: currentShopError } = await supabase
    .from("shops")
    .select("published,published_at")
    .eq("id", shopId)
    .maybeSingle();

  if (currentShopError || !currentShop) {
    console.error(
      "[Lei Port Admin] Failed to load shop before update:",
      currentShopError?.message ?? "Shop not found"
    );
    return {
      success: false,
      message: "更新するショップを取得できませんでした。",
      fieldErrors: {},
    };
  }

  const publishedAt = published
    ? currentShop.published_at ?? now
    : null;

  const { error } = await supabase
    .from("shops")
    .update({
      shop_name: shopName,
      slug,
      short_description: shortDescription,
      description,
      shop_type: shopType,
      contact_email: contactEmail,
      announcement,
      ordering_enabled: orderingEnabled,
      accepts_tuesday: acceptsTuesday,
      accepts_saturday: acceptsSaturday,
      order_cutoff_hours: orderCutoffHours,
      phone,
      address,
      website_url: websiteUrl,
      instagram_url: instagramUrl,
      display_order: displayOrder,
      published,
      published_at: publishedAt,
      show_on_public_site: showOnPublicSite,
      is_featured: isFeatured,
      updated_at: now,
      updated_by: access.platformUser.id,
    })
    .eq("id", shopId);

  if (error) {
    console.error("[Lei Port Admin] Failed to update shop:", error.message);

    if (error.code === "23505") {
      return {
        success: false,
        message: "同じslugのショップがすでに登録されています。",
        fieldErrors: {
          slug: "別のslugを入力してください。",
        },
      };
    }

    return {
      success: false,
      message: "ショップを更新できませんでした。もう一度お試しください。",
      fieldErrors: {},
    };
  }

  revalidatePath("/platform");
  revalidatePath("/platform/admin/shops");
  revalidatePath(`/platform/admin/shops/${shopId}`);
  revalidatePath(`/platform/shops/${slug}`);
  redirect("/platform/admin/shops?updated=1");
}

async function updateShopBoolean(
  shopId: string,
  field: ShopBooleanField,
  value: boolean
): Promise<ShopActionState> {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access) || !access.platformUser) {
    return {
      ok: false,
      message: "この操作を行う権限がありません。",
    };
  }

  if (!shopId) {
    return {
      ok: false,
      message: "ショップを特定できませんでした。",
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const updates: Record<string, boolean | string | null> = {
    [field]: value,
    updated_at: now,
    updated_by: access.platformUser.id,
  };

  if (field === "published") {
    updates.published_at = value ? now : null;
  }

  const { error } = await supabase
    .from("shops")
    .update(updates)
    .eq("id", shopId);

  if (error) {
    console.error("[Lei Port Admin] Failed to update shop:", error.message);
    return {
      ok: false,
      message: "ショップ情報を更新できませんでした。",
    };
  }

  revalidatePath("/platform");
  revalidatePath("/platform/admin/shops");

  return {
    ok: true,
    message: "ショップ情報を更新しました。",
  };
}

export async function setShopPublished(
  shopId: string,
  published: boolean
): Promise<ShopActionState> {
  return updateShopBoolean(shopId, "published", published);
}

export async function setShopFeatured(
  shopId: string,
  isFeatured: boolean
): Promise<ShopActionState> {
  return updateShopBoolean(shopId, "is_featured", isFeatured);
}
