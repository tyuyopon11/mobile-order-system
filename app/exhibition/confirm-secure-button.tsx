"use client";

type Props = {
  productName: string;
  price: number;
};

export default function ConfirmSecureButton({ productName, price }: Props) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const ok = window.confirm(
          `【${productName}】を確保します。\n\n価格：¥${Number(
            price ?? 0
          ).toLocaleString()}\n\n確保後は他の買参人様から閲覧できなくなります。\n\nよろしいですか？`
        );

        if (!ok) {
          e.preventDefault();
        }
      }}
      className="w-full rounded-lg bg-green-700 px-4 py-4 text-lg font-bold text-white"
    >
      🌿 商品を確保する
    </button>
  );
}