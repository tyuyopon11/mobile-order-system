"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export type ManagedProductImage = {
  id: number;
  image_url: string;
  sort_order: number | null;
};

export default function ProductImageManager({
  productId,
  productName,
  initialImages,
}: {
  productId: number;
  productName: string;
  initialImages: ManagedProductImage[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(
    [...initialImages].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )
  );
  const [message, setMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  async function upload(file: File) {
    setIsWorking(true);
    setMessage("");
    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch(
        `/api/platform/admin/products/${productId}/images`,
        { method: "POST", body: formData }
      );
      const result = (await response.json()) as {
        image?: ManagedProductImage;
        error?: string;
      };

      if (!response.ok || !result.image) {
        setMessage(result.error ?? "画像を登録できませんでした。");
        return;
      }

      setImages((current) => [...current, result.image!]);
      setMessage("画像を登録しました。");
    } catch {
      setMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsWorking(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function saveOrder(nextImages: ManagedProductImage[]) {
    setIsWorking(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/platform/admin/products/${productId}/images`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageIds: nextImages.map((image) => image.id),
          }),
        }
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(result.error ?? "画像を並び替えできませんでした。");
        return;
      }

      setImages(
        nextImages.map((image, index) => ({
          ...image,
          sort_order: index,
        }))
      );
      setMessage("画像の並び順を更新しました。");
    } catch {
      setMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsWorking(false);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    void saveOrder(next);
  }

  function makeMain(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    void saveOrder(next);
  }

  async function remove(imageId: number) {
    if (!window.confirm("この商品画像を削除しますか？")) return;
    setIsWorking(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/platform/admin/products/${productId}/images/${imageId}`,
        { method: "DELETE" }
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(result.error ?? "画像を削除できませんでした。");
        return;
      }

      setImages((current) =>
        current
          .filter((image) => image.id !== imageId)
          .map((image, index) => ({ ...image, sort_order: index }))
      );
      setMessage("画像を削除しました。");
    } catch {
      setMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-stone-500">
            JPEG・PNG・WebP／1枚5MB以下／最大6枚
          </p>
          <p className="mt-1 text-xs text-stone-400">
            先頭の画像が商品一覧と商品詳細のメイン画像になります。
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isWorking || images.length >= 6}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <button
            type="button"
            disabled={isWorking || images.length >= 6}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isWorking
              ? "処理中…"
              : images.length >= 6
                ? "最大6枚登録済み"
                : "＋ 画像を追加"}
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 px-6 py-14 text-center text-sm text-stone-500">
          商品画像はまだ登録されていません。
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-stone-100">
                <Image
                  src={image.image_url}
                  alt={`${productName} 写真${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-green-800 px-3 py-1.5 text-xs font-medium text-white shadow">
                    メイン画像
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 p-3">
                {index > 0 && (
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => makeMain(index)}
                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800"
                  >
                    メインにする
                  </button>
                )}
                <button
                  type="button"
                  disabled={isWorking || index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={isWorking || index === images.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => remove(image.id)}
                  className="ml-auto rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50"
                >
                  削除
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`mt-4 text-sm ${
            message.includes("できません") || message.includes("失敗")
              ? "text-red-600"
              : "text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
