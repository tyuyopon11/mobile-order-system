import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const PRODUCT_IMAGE_BUCKET = "exhibition-images";
export const MAX_PRODUCT_IMAGES = 6;
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PRODUCT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export function validateProductImage(file: File): string | null {
  if (file.size === 0) return "商品画像を選択してください。";
  if (!ALLOWED_PRODUCT_IMAGE_TYPES.has(file.type)) {
    return "JPEG、PNG、WebP形式の画像を選択してください。";
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return "商品画像は5MB以下にしてください。";
  }
  return null;
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

  const filePath = `${productId}/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filePath, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) throw new Error("商品画像をアップロードできませんでした。");

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(filePath);
  const { data: image, error: insertError } = await supabaseAdmin
    .from("exhibition_images")
    .insert({
      item_id: productId,
      image_url: publicUrlData.publicUrl,
      sort_order: makePrimary ? 0 : existingImages?.length ?? 0,
    })
    .select("id,image_url,sort_order")
    .single();

  if (insertError || !image) {
    await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([filePath]);
    throw new Error("商品画像の情報を保存できませんでした。");
  }
  return image;
}
