"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import imageCompression from "browser-image-compression";

type Props = {
  itemId: number;
};

export default function ImageUploadForm({ itemId }: Props) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      alert("画像ファイルを選択してください。");
      return;
    }

    try {
      setLoading(true);
      setMessage("📷 画像を圧縮しています...");

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 0.8,
      });

      console.log(
        "元サイズ:",
        (file.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      console.log(
        "圧縮後:",
        (compressedFile.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      const formData = new FormData();
      formData.append("file", compressedFile, file.name);

      setMessage("☁️ アップロードしています...");

      const response = await fetch(
        `/api/admin/exhibition/items/${itemId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "写真登録に失敗しました。");
      }

      setMessage("✅ 写真を圧縮して登録しました。");
      setFile(null);

      const input = document.getElementById(
        "image-upload"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "写真登録中にエラーが発生しました。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border bg-gray-50 p-4">
      <h3 className="mb-3 text-lg font-bold">📷 写真登録</h3>

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        capture="environment"
        className="block w-full rounded border bg-white p-2"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {file && (
        <div className="mt-3 rounded border bg-white p-3 text-sm">
          <div>
            選択中：
            <span className="ml-1 font-bold">{file.name}</span>
          </div>

          <div className="mt-2 text-gray-500">
            元サイズ：約{(file.size / 1024 / 1024).toFixed(2)}MB
          </div>

          <div className="mt-1 text-xs text-gray-400">
            アップロード前に最大0.6MB・最大1600pxへ自動圧縮します。
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 text-lg font-bold text-white transition hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "処理中..." : "📷 写真を撮影して登録"}
      </button>

      {message && (
        <div className="mt-3 rounded border bg-white p-3">{message}</div>
      )}
    </div>
  );
}