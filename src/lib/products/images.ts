import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  removePublicImage,
  uploadPublicImage,
  validateImageFile,
} from "@/lib/images/storage";

export const PRODUCT_IMAGE_BUCKET = "exhibition-images";
export const MAX_PRODUCT_IMAGES = 6;
export const MAX_PRODUCT_IMAGE_BYTES = MAX_IMAGE_BYTES;
export const ALLOWED_PRODUCT_IMAGE_TYPES = ALLOWED_IMAGE_TYPES;

export function validateProductImage(file: File): string | null {
  return validateImageFile(file, "商品画像");
}

export async function uploadProductImage(
  productId: number,
  file: File,
  options: { makePrimary?: boolean } = {}
) {
  const validationError = validateProductImage(file);
  if (validationError) throw new Error(validationError);

  const { data: existingImages, error: imagesError } = await supabaseAdmin
    .from("exhibition_images")
    .select("id,sort_order")
    .eq("item_id", productId)
    .order("sort_order", { ascending: true });

  if (imagesError) throw new Error("登録済み画像を確認できませんでした。");
  if ((existingImages?.length ?? 0) >= MAX_PRODUCT_IMAGES) {
    throw new Error(`商品画像は最大${MAX_PRODUCT_IMAGES}枚です。`);
  }

  const makePrimary = options.makePrimary === true;
  if (makePrimary && existingImages?.length) {
    const shifts = await Promise.all(
      existingImages.map((image) =>
        supabaseAdmin
          .from("exhibition_images")
          .update({ sort_order: Number(image.sort_order ?? 0) + 1 })
          .eq("id", image.id)
          .eq("item_id", productId)
      )
    );
    if (shifts.some((result) => result.error)) {
      throw new Error("商品画像の表示順を更新できませんでした。");
    }
  }

  const uploaded = await uploadPublicImage({
    bucket: PRODUCT_IMAGE_BUCKET,
    directory: String(productId),
    file,
  });
  const { data: image, error: insertError } = await supabaseAdmin
    .from("exhibition_images")
    .insert({
      item_id: productId,
      image_url: uploaded.imageUrl,
      sort_order: makePrimary ? 0 : existingImages?.length ?? 0,
    })
    .select("id,image_url,sort_order")
    .single();

  if (insertError || !image) {
    await removePublicImage(PRODUCT_IMAGE_BUCKET, uploaded.filePath);
    throw new Error("商品画像の情報を保存できませんでした。");
  }
  return image;
}
