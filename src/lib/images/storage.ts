import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export function validateImageFile(file: File, label = "画像") {
  if (file.size === 0) return `${label}を選択してください。`;
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "JPEG、PNG、WebP形式の画像を選択してください。";
  }
  if (file.size > MAX_IMAGE_BYTES) return `${label}は5MB以下にしてください。`;
  return null;
}

export async function uploadPublicImage({
  bucket,
  directory,
  file,
}: {
  bucket: string;
  directory: string;
  file: File;
}) {
  const filePath = `${directory}/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw new Error("画像をアップロードできませんでした。");
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return { imageUrl: data.publicUrl, filePath };
}

export async function removePublicImage(bucket: string, filePath: string) {
  await supabaseAdmin.storage.from(bucket).remove([filePath]);
}
