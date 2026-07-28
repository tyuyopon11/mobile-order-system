"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ExhibitionItem = {
  id: number;
  item_no: string | number | null;
  product_name: string | null;
  category: string | null;
  item: string | null;
  variety: string | null;
  tree_height: string | null;
  tree_shape: string | null;
  pot_size: string | null;
  quantity: string | number | null;
  price: string | number | null;
  origin: string | null;
  producer: string | null;
  staff: string | null;
  comment: string | null;
  jf_code: string | number | null;
};

type Props = {
  item: ExhibitionItem;
};

function inputValue(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

export default function EditItemForm({ item }: Props) {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      item_no: formData.get("item_no"),
      product_name: formData.get("product_name"),
      category: formData.get("category"),
      item: formData.get("item"),
      variety: formData.get("variety"),
      tree_height: formData.get("tree_height"),
      tree_shape: formData.get("tree_shape"),
      pot_size: formData.get("pot_size"),
      quantity: formData.get("quantity"),
      price: formData.get("price"),
      origin: formData.get("origin"),
      producer: formData.get("producer"),
      staff: formData.get("staff"),
      comment: formData.get("comment"),
      jf_code: formData.get("jf_code"),
    };

    try {
      const response = await fetch(
        `/api/admin/exhibition/items/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ?? "商品情報の更新に失敗しました。"
        );
      }

      router.push(`/admin/exhibition/${item.id}?success=update`);
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "商品情報の更新に失敗しました。"
      );

      setIsSaving(false);
    }
  }

  const inputClassName =
    "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

  const labelClassName = "block text-sm font-bold text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-bold">LPS商品情報</h2>

          <p className="mt-1 text-sm text-gray-500">
            商品の基本情報と分類を編集します。
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="rounded-xl border border-green-100 bg-green-50/50 p-5">
            <h3 className="mb-4 text-lg font-bold text-green-900">
              基本情報
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClassName}>
                商品番号
                <input
                  type="text"
                  name="item_no"
                  defaultValue={inputValue(item.item_no)}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                商品名
                <input
                  type="text"
                  name="product_name"
                  required
                  defaultValue={inputValue(item.product_name)}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                カテゴリー
                <input
                  type="text"
                  name="category"
                  defaultValue={inputValue(item.category)}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                品目
                <input
                  type="text"
                  name="item"
                  defaultValue={inputValue(item.item)}
                  className={inputClassName}
                />
              </label>

              <label className={`${labelClassName} sm:col-span-2`}>
                品種
                <input
                  type="text"
                  name="variety"
                  defaultValue={inputValue(item.variety)}
                  className={inputClassName}
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
            <h3 className="mb-4 text-lg font-bold text-emerald-900">
              植物情報
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className={labelClassName}>
                樹高
                <input
                  type="text"
                  name="tree_height"
                  defaultValue={inputValue(item.tree_height)}
                  placeholder="例：150cm"
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                樹形
                <input
                  type="text"
                  name="tree_shape"
                  defaultValue={inputValue(item.tree_shape)}
                  placeholder="例：曲がり"
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                鉢サイズ
                <input
                  type="text"
                  name="pot_size"
                  defaultValue={inputValue(item.pot_size)}
                  placeholder="例：10号"
                  className={inputClassName}
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
            <h3 className="mb-4 text-lg font-bold text-blue-900">
              販売情報
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClassName}>
                数量
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  step="1"
                  defaultValue={inputValue(item.quantity)}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                販売価格（税抜）
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="1"
                  defaultValue={inputValue(item.price)}
                  className={inputClassName}
                />
              </label>

              <label className={`${labelClassName} sm:col-span-2`}>
                コメント
                <textarea
                  name="comment"
                  rows={6}
                  defaultValue={inputValue(item.comment)}
                  className={inputClassName}
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
            <h3 className="mb-4 text-lg font-bold text-amber-900">
              生産・管理情報
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClassName}>
                産地
                <input
                  type="text"
                  name="origin"
                  defaultValue={inputValue(item.origin)}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                生産者
                <input
                  type="text"
                  name="producer"
                  defaultValue={inputValue(item.producer)}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                担当者
                <input
                  type="text"
                  name="staff"
                  defaultValue={inputValue(item.staff)}
                  className={inputClassName}
                />
              </label>

              <label className={labelClassName}>
                JFコード
                <input
                  type="text"
                  name="jf_code"
                  defaultValue={inputValue(item.jf_code)}
                  className={inputClassName}
                />
              </label>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              JFコードは任意項目です。先頭に0がある場合も、そのまま入力できます。
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-5">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isSaving ? "保存中..." : "変更を保存"}
        </button>

        <Link
          href={`/admin/exhibition/${item.id}`}
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
        >
          キャンセル
        </Link>

        <p className="w-full text-sm text-gray-500 sm:w-auto">
          保存後は商品詳細画面へ戻ります。
        </p>
      </div>
    </form>
  );
}
