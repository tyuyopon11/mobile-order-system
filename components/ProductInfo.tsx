import type { Product } from "@/lib/types/product";

type ProductInfoProps = {
  product: Product;
};

function displayValue(value: string | null | undefined) {
  return value && value.trim() !== "" ? value : "-";
}

function isTakashimayaShop(shopName: string, slug: string) {
  const normalizedName = shopName.toLowerCase();
  const normalizedSlug = slug.toLowerCase();

  return (
    normalizedName.includes("高島屋") ||
    normalizedSlug.includes("takashimaya")
  );
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const isTakashimaya = isTakashimayaShop(
    product.shop.shop_name,
    product.shop.slug
  );

  const hasClassification =
    Boolean(product.category) ||
    Boolean(product.item) ||
    Boolean(product.variety);

  const hasPlantInformation =
    Boolean(product.tree_height) ||
    Boolean(product.tree_shape) ||
    Boolean(product.pot_size);

  const hasProductionInformation =
    Boolean(product.origin) ||
    Boolean(product.producer) ||
    Boolean(product.staff) ||
    Boolean(product.jf_code);

  const isOneOfAKind =
    product.quantity !== undefined &&
    product.quantity !== null &&
    product.quantity === 1;

  return (
    <div className="space-y-7">
      <header className="border-b border-stone-200 pb-7">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
            {isTakashimaya ? "SELECTED PLANT" : "LEI PORT MARKETPLACE"}
          </p>

          {isOneOfAKind && (
            <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-stone-600">
              ONE OF A KIND
            </span>
          )}
        </div>

        <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-[2.7rem]">
          {product.name}
        </h1>

        {product.variety && (
          <p className="mt-3 text-sm leading-7 text-stone-500">
            {product.variety}
          </p>
        )}
      </header>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_12px_35px_rgba(54,65,48,0.06)] sm:p-8">
        <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
          SELECTED REASON
        </p>

        <h2 className="mt-3 text-xl font-semibold text-stone-900 sm:text-2xl">
          🌿 選んだ理由
        </h2>

        <div className="mt-5 h-px w-12 bg-green-800" />

        <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-stone-600 sm:text-base">
          {product.comment ||
            "この一鉢を選んだ理由をご紹介します。"}
        </p>
      </section>

      {hasPlantInformation && (
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_12px_35px_rgba(54,65,48,0.05)] sm:p-8">
          <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
            PLANT PROFILE
          </p>

          <h2 className="mt-3 text-xl font-semibold text-stone-900">
            植物情報
          </h2>

          <dl className="mt-6 divide-y divide-stone-200">
            <div className="grid grid-cols-[110px_1fr] gap-4 py-4 first:pt-0">
              <dt className="text-sm text-stone-400">樹高</dt>
              <dd className="text-sm font-medium text-stone-800">
                {displayValue(product.tree_height)}
              </dd>
            </div>

            <div className="grid grid-cols-[110px_1fr] gap-4 py-4">
              <dt className="text-sm text-stone-400">樹形</dt>
              <dd className="text-sm font-medium text-stone-800">
                {displayValue(product.tree_shape)}
              </dd>
            </div>

            <div className="grid grid-cols-[110px_1fr] gap-4 py-4 last:pb-0">
              <dt className="text-sm text-stone-400">鉢サイズ</dt>
              <dd className="text-sm font-medium text-stone-800">
                {displayValue(product.pot_size)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {!isTakashimaya && hasClassification && (
        <section className="rounded-[1.75rem] border border-green-100 bg-green-50/50 p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
            LEI PORT STANDARD
          </p>

          <h2 className="mt-3 text-xl font-semibold text-stone-900">
            商品分類
          </h2>

          <dl className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-stone-400">カテゴリー</dt>
              <dd className="mt-2 text-sm font-medium text-stone-800">
                {displayValue(product.category)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-stone-400">品目</dt>
              <dd className="mt-2 text-sm font-medium text-stone-800">
                {displayValue(product.item)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-stone-400">品種</dt>
              <dd className="mt-2 text-sm font-medium text-stone-800">
                {displayValue(product.variety)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {!isTakashimaya && hasProductionInformation && (
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
            PRODUCTION
          </p>

          <h2 className="mt-3 text-xl font-semibold text-stone-900">
            生産情報
          </h2>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-stone-400">産地</dt>
              <dd className="mt-2 text-sm font-medium text-stone-800">
                {displayValue(product.origin)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-stone-400">生産者</dt>
              <dd className="mt-2 text-sm font-medium text-stone-800">
                {displayValue(product.producer)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-stone-400">担当者</dt>
              <dd className="mt-2 text-sm font-medium text-stone-800">
                {displayValue(product.staff)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-stone-400">JFコード</dt>
              <dd className="mt-2 text-sm font-medium text-stone-800">
                {displayValue(product.jf_code)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_12px_35px_rgba(54,65,48,0.05)] sm:p-8">
        <p className="text-xs font-semibold tracking-[0.24em] text-green-800">
          PRICE
        </p>

        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-stone-500">
              {isTakashimaya ? "ご案内価格" : "販売価格"}
            </h2>

            <p className="mt-2 text-4xl font-semibold tracking-tight text-stone-900">
              {product.price != null
                ? `¥${product.price.toLocaleString()}`
                : "価格未設定"}
            </p>

            {product.price != null && (
              <p className="mt-2 text-xs text-stone-400">税込価格</p>
            )}
          </div>

          {product.quantity !== undefined &&
            product.quantity !== null &&
            !isTakashimaya && (
              <div className="sm:text-right">
                <p className="text-xs text-stone-400">販売可能数</p>
                <p className="mt-1 text-xl font-semibold text-stone-800">
                  {product.quantity}
                </p>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}