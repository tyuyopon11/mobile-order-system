"use client";

import { useMemo, useState } from "react";

type OrderFormProps = {
  productId: string;
  productName: string;
  unitPrice: number | null;
  availableQuantity: number | null;
  defaultEmail: string;
};

type FormValues = {
  companyName: string;
  buyerNumber: string;
  contactName: string;
  phone: string;
  email: string;
  deliveryDate: string;
  quantity: number;
  note: string;
};

export default function OrderForm({
  productId,
  productName,
  unitPrice,
  availableQuantity,
  defaultEmail,
}: OrderFormProps) {
  const maximumQuantity =
    availableQuantity !== null && availableQuantity > 0
      ? availableQuantity
      : 1;

  const [isConfirming, setIsConfirming] = useState(false);

  const [values, setValues] = useState<FormValues>({
    companyName: "",
    buyerNumber: "",
    contactName: "",
    phone: "",
    email: defaultEmail,
    deliveryDate: "",
    quantity: 1,
    note: "",
  });

  const totalPrice = useMemo(() => {
    if (unitPrice === null) {
      return null;
    }

    return unitPrice * values.quantity;
  }, [unitPrice, values.quantity]);

  function updateValue<K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsConfirming(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (isConfirming) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(54,65,48,0.07)] sm:p-8">
        <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
          CONFIRM
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-stone-900">
          注文内容の確認
        </h2>

        <p className="mt-3 text-sm leading-7 text-stone-500">
          内容に間違いがないかご確認ください。
        </p>

        <div className="mt-8 space-y-7">
          <ConfirmSection title="商品情報">
            <ConfirmRow label="商品名" value={productName} />
            <ConfirmRow
              label="注文数量"
              value={`${values.quantity}点`}
            />
            <ConfirmRow
              label="注文金額"
              value={
                totalPrice === null
                  ? "価格未設定"
                  : `${totalPrice.toLocaleString("ja-JP")}円`
              }
              strong
            />
          </ConfirmSection>

          <ConfirmSection title="購入者情報">
            <ConfirmRow
              label="店名・屋号"
              value={values.companyName}
            />
            <ConfirmRow
              label="買参人番号"
              value={values.buyerNumber}
            />
            <ConfirmRow
              label="購入担当者"
              value={values.contactName}
            />
            <ConfirmRow
              label="電話番号"
              value={values.phone}
            />
            <ConfirmRow
              label="メール"
              value={values.email}
            />
          </ConfirmSection>

          <ConfirmSection title="納品情報">
            <ConfirmRow
              label="納品・受取希望日"
              value={values.deliveryDate}
            />
            <ConfirmRow
              label="備考"
              value={values.note || "なし"}
            />
          </ConfirmSection>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className="rounded-full border border-stone-300 bg-white px-6 py-4 text-sm font-semibold text-stone-700 transition hover:border-green-800 hover:text-green-800"
          >
            入力内容を修正
          </button>

          <button
            type="button"
            onClick={() => {
              alert(
                "次の工程でSupabaseへの注文保存処理を接続します。"
              );
            }}
            className="rounded-full bg-green-800 px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)] transition hover:bg-green-900"
          >
            この内容で注文する
          </button>
        </div>

        <input type="hidden" value={productId} readOnly />
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(54,65,48,0.07)] sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
        CUSTOMER INFORMATION
      </p>

      <h2 className="mt-3 text-2xl font-semibold text-stone-900">
        購入者情報
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-7"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="店名・屋号"
            name="companyName"
            required
          >
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              value={values.companyName}
              onChange={(event) =>
                updateValue("companyName", event.target.value)
              }
              placeholder="例：フラワーショップ〇〇"
              className={inputClassName}
            />
          </Field>

          <Field
            label="買参人番号"
            name="buyerNumber"
            required
          >
            <input
              id="buyerNumber"
              name="buyerNumber"
              type="text"
              required
              value={values.buyerNumber}
              onChange={(event) =>
                updateValue("buyerNumber", event.target.value)
              }
              placeholder="例：1234-01"
              className={inputClassName}
            />
          </Field>
        </div>

        <Field
          label="購入担当者名"
          name="contactName"
          required
        >
          <input
            id="contactName"
            name="contactName"
            type="text"
            autoComplete="name"
            required
            value={values.contactName}
            onChange={(event) =>
              updateValue("contactName", event.target.value)
            }
            placeholder="例：東京 太郎"
            className={inputClassName}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="電話番号"
            name="phone"
            required
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              value={values.phone}
              onChange={(event) =>
                updateValue("phone", event.target.value)
              }
              placeholder="例：090-1234-5678"
              className={inputClassName}
            />
          </Field>

          <Field
            label="メールアドレス"
            name="email"
            required
          >
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={values.email}
              onChange={(event) =>
                updateValue("email", event.target.value)
              }
              placeholder="example@company.jp"
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="border-t border-stone-100 pt-7">
          <p className="text-xs font-semibold tracking-[0.2em] text-green-800">
            ORDER DETAILS
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="注文数量"
            name="quantity"
            required
          >
            <select
              id="quantity"
              name="quantity"
              required
              value={values.quantity}
              onChange={(event) =>
                updateValue(
                  "quantity",
                  Number(event.target.value)
                )
              }
              className={inputClassName}
            >
              {Array.from(
                {
                  length: maximumQuantity,
                },
                (_, index) => index + 1
              ).map((quantity) => (
                <option
                  key={quantity}
                  value={quantity}
                >
                  {quantity}点
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="納品・受取希望日"
            name="deliveryDate"
            required
          >
            <input
              id="deliveryDate"
              name="deliveryDate"
              type="date"
              required
              value={values.deliveryDate}
              onChange={(event) =>
                updateValue("deliveryDate", event.target.value)
              }
              className={inputClassName}
            />
          </Field>
        </div>

        <Field label="不明点・お問い合わせ・備考" name="note">
          <textarea
            id="note"
            name="note"
            rows={5}
            value={values.note}
            onChange={(event) =>
              updateValue("note", event.target.value)
            }
            placeholder="配送や商品についての確認事項があれば入力してください。"
            className={`${inputClassName} resize-y`}
          />
        </Field>

        <div className="rounded-2xl bg-stone-50 p-5">
          <div className="flex items-center justify-between gap-5">
            <span className="text-sm text-stone-500">
              注文予定金額
            </span>

            <span className="text-xl font-semibold text-stone-900">
              {totalPrice === null
                ? "価格未設定"
                : `${totalPrice.toLocaleString("ja-JP")}円`}
            </span>
          </div>

          <p className="mt-2 text-xs leading-6 text-stone-400">
            最終的な納品内容は、注文受付後に担当者よりご案内します。
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-green-800 px-6 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-green-900 hover:shadow-[0_14px_30px_rgba(22,101,52,0.22)] sm:py-5"
        >
          注文内容を確認する
        </button>
      </form>
    </section>
  );
}

const inputClassName =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-100";

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
};

function Field({
  label,
  name,
  required = false,
  children,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-stone-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

type ConfirmSectionProps = {
  title: string;
  children: React.ReactNode;
};

function ConfirmSection({
  title,
  children,
}: ConfirmSectionProps) {
  return (
    <section className="rounded-2xl border border-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-900">
        {title}
      </h3>

      <dl className="mt-4 space-y-3">
        {children}
      </dl>
    </section>
  );
}

type ConfirmRowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

function ConfirmRow({
  label,
  value,
  strong = false,
}: ConfirmRowProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="shrink-0 text-sm text-stone-400">
        {label}
      </dt>

      <dd
        className={`whitespace-pre-wrap text-right text-sm ${
          strong
            ? "font-semibold text-stone-900"
            : "font-medium text-stone-700"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}