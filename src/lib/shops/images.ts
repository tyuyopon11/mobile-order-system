import {
  removePublicImage,
  uploadPublicImage,
  validateImageFile,
} from "@/lib/images/storage";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const SHOP_ASSET_BUCKET = "shop-assets";

export async function saveShopLogo(
  shopId: string,
  file: File,
  updatedBy: string
) {
  const validationError = validateImageFile(file, "ロゴ画像");
  if (validationError) throw new Error(validationError);

  const { data: shop, error: shopError } = await supabaseAdmin
    .from("shops")
    .select("id")
    .eq("id", shopId)
    .maybeSingle();
  if (shopError || !shop) throw new Error("ショップを確認できませんでした。");

  const uploaded = await uploadPublicImage({
    bucket: SHOP_ASSET_BUCKET,
    directory: `${shopId}/logo`,
    file,
  });
  const { error } = await supabaseAdmin
    .from("shops")
    .update({
      logo_url: uploaded.imageUrl,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    })
    .eq("id", shopId);
  if (error) {
    await removePublicImage(SHOP_ASSET_BUCKET, uploaded.filePath);
    throw new Error("ロゴ画像の情報を保存できませんでした。");
  }
  return uploaded.imageUrl;
}
