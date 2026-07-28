"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  updateProduct,
  type ProductActionState,
} from "../actions";
import {
  DEFAULT_SALES_UNIT,
  SALES_UNITS,
} from "@/lib/products/sales-unit";

type ShopOption = {
  id: string;
  shop_name: string;
};

export type EditableProduct = {
  id: number;
  shop_id: string;
  item_no: number;
  product_name: string | null;
  category: string | null;
  item: string | null;
  variety: string | null;
  spec: string | null;
  tree_height: string | null;
  tree_shape: string | null;
  pot_size: string | null;
  quantity: number | null;
  price: number | null;
  irisu?: number | null;
  sales_unit: string | null;
  units_per_sales_unit: number | null;
  origin: string | null;
  producer: string | null;
  staff: string | null;
  comment: string | null;
  jf_code: string | null;
  status: string;
  published: boolean;
  is_featured: boolean;
};

const initialState: ProductActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-stone-100";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 text-xs leading-5 text-red-600">{message}</p>
  ) : null;
}

export default function EditProductForm({
  product,
  shops,
}: {
  product: EditableProduct;
  shops: ShopOption[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="productId" value={product.id} />

      {state.message && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </div>
      )}

      <fieldset className="rounded-2xl border border-green-100 bg-green-50/40 p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold text-green-900">
          基本情報
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="shopId" className="mb-2 block text-sm font-medium">
              ショップ <span className="text-red-600">*</span>
            </label>
            <select
              id="shopId"
              name="shopId"
              required
              defaultValue={product.shop_id}
              disabled={isPending}
              className={inputClass}
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.shop_name}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors.shopId} />
          </div>
          <div>
            <label htmlFor="itemNo" className="mb-2 block text-sm font-medium">
              商品番号 <span className="text-red-600">*</span>
            </label>
            <input
              id="itemNo"
              name="itemNo"
              type="number"
              min={1}
              max={999999}
              step={1}
              required
              defaultValue={product.item_no}
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.itemNo} />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="productName"
              className="mb-2 block text-sm font-medium"
            >
              商品名 <span className="text-red-600">*</span>
            </label>
            <input
              id="productName"
              name="productName"
              required
              maxLength={300}
              defaultValue={product.product_name ?? ""}
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.productName} />
          </div>
          {[
            ["category", "カテゴリー", product.category],
            ["item", "品目", product.item],
            ["variety", "品種", product.variety],
            ["spec", "規格", product.spec],
          ].map(([name, label, value]) => (
            <div key={String(name)}>
              <label
                htmlFor={String(name)}
                className="mb-2 block text-sm font-medium"
              >
                {String(label)}
              </label>
              <input
                id={String(name)}
                name={String(name)}
                defaultValue={value ?? ""}
                disabled={isPending}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold text-emerald-900">
          植物情報
        </legend>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            ["treeHeight", "樹高", product.tree_height],
            ["treeShape", "樹形", product.tree_shape],
            ["potSize", "鉢サイズ", product.pot_size],
          ].map(([name, label, value]) => (
            <div key={String(name)}>
              <label
                htmlFor={String(name)}
                className="mb-2 block text-sm font-medium"
              >
                {String(label)}
              </label>
              <input
                id={String(name)}
                name={String(name)}
                defaultValue={value ?? ""}
                disabled={isPending}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold text-blue-900">
          販売情報
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="salesUnit" className="mb-2 block text-sm font-medium">
              販売単位 <span className="text-red-600">*</span>
            </label>
            <select
              id="salesUnit"
              name="salesUnit"
              required
              defaultValue={product.sales_unit ?? DEFAULT_SALES_UNIT}
              disabled={isPending}
              className={inputClass}
            >
              {SALES_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors.salesUnit} />
          </div>
          <div>
            <label
              htmlFor="unitsPerSalesUnit"
              className="mb-2 block text-sm font-medium"
            >
              入数 <span className="text-red-600">*</span>
            </label>
            <input
              id="unitsPerSalesUnit"
              name="unitsPerSalesUnit"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={product.irisu ?? product.units_per_sales_unit ?? 1}
              disabled={isPending}
              className={inputClass}
            />
            <p className="mt-2 text-xs leading-5 text-stone-500">
              1販売単位に含まれる鉢・個・本などの実数量です。
            </p>
            <FieldError message={state.fieldErrors.unitsPerSalesUnit} />
          </div>
          <div>
            <label htmlFor="quantity" className="mb-2 block text-sm font-medium">
              販売可能数（販売単位）
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              step={1}
              defaultValue={product.quantity ?? ""}
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.quantity} />
          </div>
          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium">
              1販売単位あたりの税抜価格
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={product.price ?? ""}
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.price} />
          </div>
          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium">
              販売状態
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
              disabled={isPending}
              className={inputClass}
            >
              <option value="preparing">準備中</option>
              <option value="selling">販売中</option>
              <option value="sold">売約済み</option>
            </select>
            <FieldError message={state.fieldErrors.status} />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="comment" className="mb-2 block text-sm font-medium">
              商品コメント
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={6}
              defaultValue={product.comment ?? ""}
              disabled={isPending}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold text-amber-900">
          生産・管理情報
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            ["origin", "産地", product.origin],
            ["producer", "生産者", product.producer],
            ["staff", "担当者", product.staff],
            ["jfCode", "JFコード", product.jf_code],
          ].map(([name, label, value]) => (
            <div key={String(name)}>
              <label
                htmlFor={String(name)}
                className="mb-2 block text-sm font-medium"
              >
                {String(label)}
              </label>
              <input
                id={String(name)}
                name={String(name)}
                defaultValue={value ?? ""}
                disabled={isPending}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-around">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            name="published"
            type="checkbox"
            defaultChecked={product.published}
            disabled={isPending}
            className="h-4 w-4 accent-green-800"
          />
          Marketplaceに公開する
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={product.is_featured}
            disabled={isPending}
            className="h-4 w-4 accent-green-800"
          />
          おすすめ商品にする
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/platform/admin/products"
          className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-green-800 px-6 py-3 text-sm font-medium text-white hover:bg-green-900 disabled:cursor-wait disabled:bg-stone-400"
        >
          {isPending ? "更新中…" : "変更を保存"}
        </button>
      </div>
    </form>
  );
}
