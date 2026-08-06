"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createProduct,
  type ProductActionState,
} from "../actions";
import {
  DEFAULT_SALES_UNIT,
  SALES_UNITS,
} from "@/lib/products/sales-unit";
import { PRODUCT_CATEGORIES } from "@/lib/products/categories";
import ProductSalesPeriodField from "@/components/product/ProductSalesPeriodField";
import ProductReservationPeriodField from "@/components/product/ProductReservationPeriodField";
import PickupCommentField from "@/components/product/PickupCommentField";

type ShopOption = {
  id: string;
  shop_name: string;
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

export default function ProductForm({ shops }: { shops: ShopOption[] }) {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
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
              defaultValue=""
              disabled={isPending}
              className={inputClass}
            >
              <option value="" disabled>
                選択してください
              </option>
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
              商品番号
            </label>
            <input
              id="itemNo"
              name="itemNo"
              type="number"
              min={1}
              max={999999}
              step={1}
              disabled={isPending}
              placeholder="空欄なら自動採番"
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
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.productName} />
          </div>

          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium">カテゴリー</label>
            <select id="category" name="category" defaultValue="" disabled={isPending} className={inputClass}>
              <option value="">選択してください</option>
              {PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <FieldError message={state.fieldErrors.category} />
          </div>
          {[
            ["item", "品目"],
            ["variety", "品種"],
            ["spec", "規格"],
          ].map(([name, label]) => (
            <div key={name}>
              <label htmlFor={name} className="mb-2 block text-sm font-medium">
                {label}
              </label>
              <input
                id={name}
                name={name}
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
            ["treeHeight", "樹高", "例：150cm"],
            ["treeShape", "樹形", "例：曲がり"],
            ["potSize", "鉢サイズ", "例：10号"],
          ].map(([name, label, placeholder]) => (
            <div key={name}>
              <label htmlFor={name} className="mb-2 block text-sm font-medium">
                {label}
              </label>
              <input
                id={name}
                name={name}
                placeholder={placeholder}
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
              defaultValue={DEFAULT_SALES_UNIT}
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
              defaultValue={1}
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
              defaultValue="preparing"
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
            ["origin", "産地"],
            ["producer", "生産者"],
            ["staff", "担当者"],
            ["jfCode", "JFコード"],
          ].map(([name, label]) => (
            <div key={name}>
              <label htmlFor={name} className="mb-2 block text-sm font-medium">
                {label}
              </label>
              <input
                id={name}
                name={name}
                disabled={isPending}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <ProductReservationPeriodField />
      <FieldError message={state.fieldErrors.reservationPeriod} />
      <ProductSalesPeriodField />
      <FieldError message={state.fieldErrors.salesPeriod} />
      <PickupCommentField disabled={isPending} />
      <FieldError message={state.fieldErrors.pickupComment} />

      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-around">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            name="published"
            type="checkbox"
            disabled={isPending}
            className="h-4 w-4 accent-green-800"
          />
          Marketplaceに公開する
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            name="isFeatured"
            type="checkbox"
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
          {isPending ? "登録中…" : "商品を登録"}
        </button>
      </div>
    </form>
  );
}
