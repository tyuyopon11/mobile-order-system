"use client";

import imageCompression from "browser-image-compression";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type Props = {
  existingImageUrl?: string | null;
};

export default function ProductImageField({ existingImageUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl ?? "");
  const [message, setMessage] = useState("");
  const [compressing, setCompressing] = useState(false);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const source = event.target.files?.[0];
    setMessage("");
    if (!source) {
      setPreviewUrl(existingImageUrl ?? "");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(source.type)) {
      event.target.value = "";
      setMessage("JPEG、PNG、WebP形式の画像を選択してください。");
      return;
    }

    try {
      setCompressing(true);
      const compressed = await imageCompression(source, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 0.8,
        fileType: source.type,
      });
      const uploadFile = new File([compressed], source.name, {
        type: compressed.type || source.type,
        lastModified: Date.now(),
      });
      const transfer = new DataTransfer();
      transfer.items.add(uploadFile);
      if (inputRef.current) inputRef.current.files = transfer.files;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(uploadFile);
      setPreviewUrl(objectUrlRef.current);
      setMessage(`${source.name} を選択しました。保存時に登録します。`);
    } catch {
      event.target.value = "";
      setMessage("画像を準備できませんでした。別の画像を選択してください。");
    } finally {
      setCompressing(false);
    }
  }

  return (
    <div className="sm:col-span-2">
      <p className="text-sm font-medium text-stone-800">商品画像（任意）</p>
      <div className="mt-2 grid gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-[160px_1fr] sm:items-center">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-white">
          {previewUrl ? (
            <Image src={previewUrl} alt="商品画像プレビュー" fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs leading-6 text-stone-500">
              商品画像は今後追加できます
            </div>
          )}
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-green-800 bg-white px-4 py-3 text-sm font-medium text-green-800 hover:bg-green-50">
            {existingImageUrl ? "画像を変更" : "画像を選択"}
            <input
              ref={inputRef}
              name="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={compressing}
              onChange={onChange}
            />
          </label>
          <p className="mt-3 text-xs leading-5 text-stone-500">
            JPEG・PNG・WebP対応。選択した画像は自動で軽量化します。画像なしでも下書き保存・公開できます。
          </p>
          {message && <p className="mt-2 text-xs text-stone-700" role="status">{message}</p>}
          {compressing && <p className="mt-2 text-xs text-green-800" role="status">画像を準備しています…</p>}
        </div>
      </div>
    </div>
  );
}
