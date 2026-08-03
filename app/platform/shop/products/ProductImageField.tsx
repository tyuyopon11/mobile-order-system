import ImageUploadField from "@/components/forms/ImageUploadField";

export default function ProductImageField({
  existingImageUrl,
}: {
  existingImageUrl?: string | null;
}) {
  return (
    <ImageUploadField
      name="imageFile"
      label="商品画像（任意）"
      existingImageUrl={existingImageUrl}
      emptyMessage="商品画像は今後追加できます"
      helpText="JPEG・PNG・WebP対応。選択した画像は自動で軽量化します。画像なしでも下書き保存・公開できます。"
    />
  );
}
