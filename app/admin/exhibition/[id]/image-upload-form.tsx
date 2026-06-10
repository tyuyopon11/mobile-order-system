"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/admin/exhibition/items/${itemId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setMessage("✅ 写真を登録しました。");
      setFile(null);

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
      <h3 className="mb-3 text-lg font-bold">
        📷 写真登録
      </h3>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="block w-full rounded border bg-white p-2"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {file && (
        <div className="mt-3 rounded border bg-white p-3 text-sm">
          選択中：
          <span className="font-bold ml-1">
            {file.name}
          </span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 text-lg font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading
          ? "アップロード中..."
          : "📷 写真を撮影して登録"}
      </button>

      {message && (
        <div className="mt-3 rounded border bg-white p-3">
          {message}
        </div>
      )}
    </div>
  );
}