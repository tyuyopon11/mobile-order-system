import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/services/product";
import {
  formatUnitsPerSalesUnit,
  getSalesUnitLabel,
} from "@/lib/products/sales-unit";
import {
  generateFallbackAuctionDates,
  isShopAuctionDate,
  todayInTokyo,
} from "@/lib/orders/auction-dates";
import OrderForm from "./OrderForm";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type PlatformUserProfile = {
  company_name: string;
  buyer_no: string | null;
  branch_no: string | null;
  name: string;
  phone: string | null;
  email: string;
  approval_status: string;
  is_active: boolean;
};

function formatPrice(price: number | null) {
  if (price === null) {
    return "価格未設定";
  }

  return `${price.toLocaleString("ja-JP")}円`;
}

function getBuyerNumber(
  buyerNo: string | null,
  branchNo: string | null
) {
  if (!buyerNo) {
    return "";
  }

  if (!branchNo) {
    return buyerNo;
  }

  return `${buyerNo}-${branchNo}`;
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
    redirect(
      `/platform/login?next=${encodeURIComponent(
        `/platform/order/${id}`
      )}`
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("platform_users")
      .select(
        `
          company_name,
          buyer_no,
          branch_no,
          name,
          phone,
          email,
          approval_status,
          is_active
        `
      )
      .eq("auth_user_id", user.id)
      .maybeSingle<PlatformUserProfile>();

  if (profileError) {
    console.error(
      "[Lei Port Order] Failed to load buyer profile:",
      profileError.message
    );
  }

  if (
    !profile ||
    profile.approval_status !== "approved" ||
    !profile.is_active
  ) {
    await supabase.auth.signOut();

    redirect(
      `/platform/login?next=${encodeURIComponent(
        `/platform/order/${id}`
      )}`
    );
  }

  const product = await getProduct(id).catch(() => null);

  if (!product) {
    notFound();
  }
  const { data: auctionDateRows, error: auctionDatesError } = await supabase
    .from("auction_dates")
    .select("auction_date")
    .eq("is_active", true)
    .gte("auction_date", todayInTokyo())
    .order("auction_date", { ascending: true })
    .limit(60);

  if (auctionDatesError) {
    console.error(
      "[Lei Port Order] Failed to load auction_dates:",
      auctionDatesError.message
    );
  }

  const configuredDates =
    !auctionDatesError && auctionDateRows?.length
      ? auctionDateRows.map((row) => String(row.auction_date))
      : generateFallbackAuctionDates();

  const allowedAuctionDates = configuredDates.filter((date) =>
    isShopAuctionDate(date, {
      orderingEnabled: product.shop.ordering_enabled,
      acceptsTuesday: product.shop.accepts_tuesday,
      acceptsSaturday: product.shop.accepts_saturday,
      cutoffHours: product.shop.order_cutoff_hours,
    })
  );

  const isSoldOut =
    product.quantity !== null && product.quantity <= 0;

  if (isSoldOut) {
    redirect(`/platform/products/${product.id}`);
  }

  return (
    <main className="min-h-screen bg-[#f4f0e8] px-5 py-6 text-[#25342c] sm:px-8 sm:py-10">
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

          <h1 className="mt-3 font-serif text-3xl tracking-tight text-[#26382f] sm:text-4xl">
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
                  <dt className="text-stone-400">販売価格（税抜）</dt>
                  <dd className="text-right text-lg font-semibold text-stone-900">
                    {formatPrice(product.price)}／
                    {getSalesUnitLabel(product.sales_unit)}
                  </dd>
                </div>
                <div className="flex justify-between gap-5">
                  <dt className="text-stone-400">販売単位・入数</dt>
                  <dd className="text-right font-medium text-stone-700">
                    {formatUnitsPerSalesUnit(
                      product.units_per_sales_unit,
                      product.sales_unit
                    )}
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
            salesUnit={product.sales_unit}
            unitsPerSalesUnit={product.irisu}
            allowedAuctionDates={allowedAuctionDates}
            defaultCompanyName={profile.company_name}
            defaultBuyerNumber={getBuyerNumber(
              profile.buyer_no,
              profile.branch_no
            )}
            defaultContactName={profile.name}
            defaultPhone={profile.phone ?? ""}
            defaultEmail={profile.email || user.email || ""}
          />
        </div>
      </div>
    </main>
  );
}
