import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/services/product";
import OrderForm from "./OrderForm";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPrice(price: number | null) {
  if (price === null) {
    return "価格未設定";
  }

  return `${price.toLocaleString("ja-JP")}円`;
}

export default async function OrderPage({
  params,
}: OrderPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/platform/login");
  }

  const product = await getProduct(id);

  const isSoldOut =
    product.quantity !== null && product.quantity <= 0;

  if (isSoldOut) {
    redirect(`/platform/products/${product.id}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <Link
            href={`/platform/products/${product.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-green-800"
          >
            <span aria-hidden="true">←</span>
            商品詳細へ戻る
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
            ORDER
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            購入手続き
          </h1>

          <p className="mt-4 text-sm leading-7 text-stone-500 sm:text-base">
            商品内容をご確認のうえ、購入者情報と納品希望日を入力してください。
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(480px,1.18fr)] lg:gap-10">
          <aside className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_18px_50px_rgba(54,65,48,0.07)] lg:sticky lg:top-8">
            <div className="relative aspect-[4/3] bg-stone-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl">
                  🌿
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-green-800">
                {product.shop.shop_name}
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-stone-900">
                {product.name}
              </h2>

              <dl className="mt-6 space-y-3 border-t border-stone-100 pt-6 text-sm">
                {product.variety && (
                  <div className="flex justify-between gap-5">
                    <dt className="text-stone-400">品種</dt>
                    <dd className="text-right font-medium text-stone-700">
                      {product.variety}
                    </dd>
                  </div>
                )}

                {product.pot_size && (
                  <div className="flex justify-between gap-5">
                    <dt className="text-stone-400">鉢サイズ</dt>
                    <dd className="text-right font-medium text-stone-700">
                      {product.pot_size}
                    </dd>
                  </div>
                )}

                {product.tree_height && (
                  <div className="flex justify-between gap-5">
                    <dt className="text-stone-400">高さ</dt>
                    <dd className="text-right font-medium text-stone-700">
                      {product.tree_height}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between gap-5">
                  <dt className="text-stone-400">販売価格</dt>
                  <dd className="text-right text-lg font-semibold text-stone-900">
                    {formatPrice(product.price)}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>

          <OrderForm
            productId={String(product.id)}
            productName={product.name}
            unitPrice={product.price}
            availableQuantity={product.quantity}
            defaultEmail={user.email ?? ""}
          />
        </div>
      </div>
    </main>
  );
}