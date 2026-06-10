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

      const response = await fetch(`/api/admin/exhibition/items/${itemId}/images`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setMessage("写真を登録しました。");
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
    <div className="mt-6 rounded border bg-gray-50 p-4">
      <h3 className="font-bold">写真アップロード</h3>

      <input
        type="file"
        accept="image/*"
        className="mt-3 block w-full"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "アップロード中..." : "写真をアップロード"}
      </button>

      {message && (
        <div className="mt-3 rounded border bg-white p-3">
          {message}
        </div>
      )}
    </div>
  );
}