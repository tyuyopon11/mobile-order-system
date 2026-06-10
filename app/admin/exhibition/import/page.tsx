"use client";

import { useState } from "react";

export default function ExhibitionImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      alert("Excelファイルを選択してください。");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/exhibition/import",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setMessage(
        `取込完了：${result.exhibitionName} (${result.itemCount}件)`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "エラーが発生しました。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        展示会Excel取込
      </h1>

      <div className="mt-6 rounded-lg border bg-white p-6">
        <p className="mb-4 text-gray-600">
          展示会リストExcelをアップロードしてください。
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) =>
            setFile(e.target.files?.[0] ?? null)
          }
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "取込中..." : "アップロード"}
        </button>

        {message && (
          <div className="mt-4 rounded border p-3">
            {message}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border bg-yellow-50 p-4">
        <h2 className="font-bold">
          取込対象
        </h2>

        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>展示会設定シート</li>
          <li>観葉展示リストシート</li>
        </ul>
      </div>
    </div>
  );
}