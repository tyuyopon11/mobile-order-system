"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createShop,
  type CreateShopState,
} from "../actions";

const initialState: CreateShopState = {
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

export default function ShopForm() {
  const [state, formAction, isPending] = useActionState(
    createShop,
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="shopName" className="mb-2 block text-sm font-medium">
            ショップ名 <span className="text-red-600">*</span>
          </label>
          <input
            id="shopName"
            name="shopName"
            required
            maxLength={200}
            disabled={isPending}
            placeholder="高島屋植物園"
            className={inputClass}
          />
          <FieldError message={state.fieldErrors.shopName} />
        </div>

        <div>
          <label htmlFor="slug" className="mb-2 block text-sm font-medium">
            slug <span className="text-red-600">*</span>
          </label>
          <input
            id="slug"
            name="slug"
            required
            maxLength={100}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            disabled={isPending}
            placeholder="takashimaya-plants"
            className={inputClass}
          />
          <p className="mt-2 text-xs text-stone-400">
            URLに使用します。半角英数字とハイフンのみ入力できます。
          </p>
          <FieldError message={state.fieldErrors.slug} />
        </div>

        <div>
          <label htmlFor="shopType" className="mb-2 block text-sm font-medium">
            ショップ種別 <span className="text-red-600">*</span>
          </label>
          <select
            id="shopType"
            name="shopType"
            required
            defaultValue=""
            disabled={isPending}
            className={inputClass}
          >
            <option value="" disabled>
              選択してください
            </option>
            <option value="market">市場</option>
            <option value="plant_shop">園芸店</option>
            <option value="producer">生産者</option>
            <option value="vendor">仲卸・卸売</option>
            <option value="corporate">法人</option>
            <option value="brand">ブランド</option>
            <option value="exhibition">展示販売</option>
            <option value="official">Lei Port公式</option>
          </select>
          <FieldError message={state.fieldErrors.shopType} />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="shortDescription"
            className="mb-2 block text-sm font-medium"
          >
            短い紹介文
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            maxLength={200}
            disabled={isPending}
            placeholder="ショップカードなどに表示する短い紹介文"
            className={inputClass}
          />
          <FieldError message={state.fieldErrors.shortDescription} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            ショップ説明
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            maxLength={5000}
            disabled={isPending}
            placeholder="ショップの特徴や取り扱い商品について入力してください。"
            className={inputClass}
          />
          <FieldError message={state.fieldErrors.description} />
        </div>
      </div>

      <fieldset className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
        <legend className="px-2 text-sm font-semibold text-stone-800">
          連絡先・外部リンク
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contactEmail" className="mb-2 block text-sm">
              問い合わせメール
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.contactEmail} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="announcement" className="mb-2 block text-sm font-medium">
              ショップからのお知らせ
            </label>
            <textarea
              id="announcement"
              name="announcement"
              rows={4}
              disabled={isPending}
              className={inputClass}
              placeholder="臨時休業、出荷案内、品質情報など"
            />
          </div>

          <div>
            <label htmlFor="orderCutoffHours" className="mb-2 block text-sm font-medium">
              注文締切（競り日の何時間前）
            </label>
            <input
              id="orderCutoffHours"
              name="orderCutoffHours"
              type="number"
              min={1}
              required
              defaultValue={24}
              disabled={isPending}
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="orderingEnabled" defaultChecked />
              注文受付ON
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="acceptsTuesday" defaultChecked />
              火曜競り
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="acceptsSaturday" defaultChecked />
              土曜競り
            </label>
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm">
              電話番号
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              maxLength={30}
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.phone} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-2 block text-sm">
              所在地
            </label>
            <input
              id="address"
              name="address"
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.address} />
          </div>
          <div>
            <label htmlFor="websiteUrl" className="mb-2 block text-sm">
              公式サイト
            </label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              placeholder="https://"
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.websiteUrl} />
          </div>
          <div>
            <label htmlFor="instagramUrl" className="mb-2 block text-sm">
              Instagram
            </label>
            <input
              id="instagramUrl"
              name="instagramUrl"
              type="url"
              placeholder="https://www.instagram.com/..."
              disabled={isPending}
              className={inputClass}
            />
            <FieldError message={state.fieldErrors.instagramUrl} />
          </div>
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <div>
          <label htmlFor="displayOrder" className="mb-2 block text-sm font-medium">
            表示順
          </label>
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min={0}
            max={9999}
            step={1}
            defaultValue={0}
            disabled={isPending}
            className={inputClass}
          />
          <FieldError message={state.fieldErrors.displayOrder} />
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-around">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              name="published"
              type="checkbox"
              disabled={isPending}
              className="h-4 w-4 accent-green-800"
            />
            登録後すぐに公開する
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              name="isFeatured"
              type="checkbox"
              disabled={isPending}
              className="h-4 w-4 accent-green-800"
            />
            おすすめに表示する
          </label>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/platform/admin/shops"
          className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-green-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-900 disabled:cursor-wait disabled:bg-stone-400"
        >
          {isPending ? "登録中…" : "ショップを登録"}
        </button>
      </div>
    </form>
  );
}
