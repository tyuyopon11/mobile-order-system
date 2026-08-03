"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type AssetKind = "logo" | "banner";

type ShopImageManagerProps = {
  shopId: string;
  shopName: string;
  initialBannerUrl: string | null;
};

type AssetCardProps = {
  shopId: string;
  shopName: string;
  kind: AssetKind;
  initialUrl: string | null;
};

function AssetCard({
  shopId,
  shopName,
  kind,
  initialUrl,
}: AssetCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [message, setMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const isLogo = kind === "logo";
  const label = isLogo ? "ロゴ" : "バナー";

  async function upload(file: File) {
    setIsWorking(true);
    setMessage("");

    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("file", file);

    try {
      const response = await fetch(
        `/api/platform/admin/shops/${shopId}/assets`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.imageUrl) {
        setMessage(result.error ?? `${label}をアップロードできませんでした。`);
        return;
      }

      setUrl(result.imageUrl);
      setMessage(`${label}を更新しました。`);
    } catch {
      setMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsWorking(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    if (!window.confirm(`${label}を削除しますか？`)) return;

    setIsWorking(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/platform/admin/shops/${shopId}/assets?kind=${kind}`,
        { method: "DELETE" }
      );
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setMessage(result.error ?? `${label}を削除できませんでした。`);
        return;
      }

      setUrl(null);
      setMessage(`${label}を削除しました。`);
    } catch {
      setMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <article className="rounded-2xl border border-stone-200 p-5">
      <div>
        <h3 className="font-semibold text-stone-900">{label}画像</h3>
        <p className="mt-1 text-xs leading-5 text-stone-500">
          JPEG・PNG・WebP／{isLogo ? "2MB" : "5MB"}以下
        </p>
      </div>

      <div
        className={`relative mt-4 flex overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 ${
          isLogo
            ? "h-44 items-center justify-center"
            : "aspect-[16/5] items-center justify-center"
        }`}
      >
        {url ? (
          <Image
            src={url}
            alt={`${shopName}の${label}`}
            fill
            sizes={isLogo ? "320px" : "(max-width: 768px) 100vw, 700px"}
            className={isLogo ? "object-contain p-5" : "object-cover"}
          />
        ) : (
          <span className="text-sm text-stone-400">画像未登録</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={isWorking}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isWorking}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-green-800 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-green-900 disabled:cursor-wait disabled:bg-stone-400"
        >
          {isWorking ? "処理中…" : url ? `${label}を変更` : `${label}を登録`}
        </button>

        {url && (
          <button
            type="button"
            disabled={isWorking}
            onClick={remove}
            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            削除
          </button>
        )}
      </div>

      {message && (
        <p
          role="status"
          className={`mt-3 text-xs ${
            message.includes("できません") || message.includes("失敗")
              ? "text-red-600"
              : "text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </article>
  );
}

export default function ShopImageManager({
  shopId,
  shopName,
  initialBannerUrl,
}: ShopImageManagerProps) {
  return (
    <div>
      <AssetCard
        shopId={shopId}
        shopName={shopName}
        kind="banner"
        initialUrl={initialBannerUrl}
      />
    </div>
  );
}
