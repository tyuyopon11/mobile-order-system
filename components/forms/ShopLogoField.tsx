import ImageUploadField from "@/components/forms/ImageUploadField";

export default function ShopLogoField({
  existingImageUrl,
}: {
  existingImageUrl?: string | null;
}) {
  return (
    <ImageUploadField
      name="logoFile"
      label="ロゴ画像（任意）"
      existingImageUrl={existingImageUrl}
      emptyMessage="ロゴ画像は後から追加できます"
      helpText="JPEG・PNG・WebP対応。選択した画像は自動で軽量化します。画像を選択しなければ現在のロゴを維持します。"
      previewFit="contain"
    />
  );
}
