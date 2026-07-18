import Link from "next/link";

import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import PurchaseCard from "@/components/PurchaseCard";
import ShopCard from "@/components/ShopCard";
import { getProduct } from "@/lib/services/product";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <main className="min-h-screen bg-[#f5f4ef]">
      <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className="mb-7">
          <Link
            href={`/platform/shops/${product.shop.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-green-800"
          >
            <span aria-hidden="true">←</span>
            {product.shop.shop_name}へ戻る
          </Link>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:gap-14">
          <div className="lg:sticky lg:top-8">
            <ProductGallery product={product} />
          </div>

          <div className="space-y-7">
            <ProductInfo product={product} />

            <PurchaseCard
              quantity={product.quantity}
              shopSlug={product.shop.slug}
            />

            <ShopCard shop={product.shop} />
          </div>
        </div>
      </div>
    </main>
  );
}