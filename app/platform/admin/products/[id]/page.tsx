import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import EditProductForm, {
  type EditableProduct,
} from "./EditProductForm";
import ProductImageManager, {
  type ManagedProductImage,
} from "./ProductImageManager";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access)) {
    redirect("/platform");
  }

  const { id } = await params;
  const [{ data: product, error }, { data: shops }] = await Promise.all([
    supabaseAdmin
      .from("exhibition_items")
      .select(
        `
          id,
          shop_id,
          item_no,
          product_name,
          category,
          item,
          variety,
          spec,
          tree_height,
          tree_shape,
          pot_size,
          quantity,
          price,
          irisu,
          sales_unit,
          units_per_sales_unit,
          origin,
          producer,
          staff,
          comment,
          jf_code,
          status,
          published,
          is_featured,
          exhibition_images (
            id,
            image_url,
            sort_order
          )
        `
      )
      .eq("id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("shops")
      .select("id,shop_name")
      .order("display_order", { ascending: true }),
  ]);

  if (error || !product) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/platform/admin/products"
        className="inline-flex text-sm font-medium text-stone-500 transition hover:text-green-800"
      >
        ← 商品一覧へ戻る
      </Link>

      <section className="mt-4 rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          EDIT PRODUCT
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          商品編集
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-500 sm:text-base">
          {product.product_name ?? "商品名未設定"}の商品情報と公開状態を編集します。
        </p>
      </section>

      <section className="mt-6 rounded-[24px] border border-stone-200 bg-white px-6 py-7 shadow-sm sm:px-9 sm:py-9">
        <EditProductForm
          product={product as unknown as EditableProduct}
          shops={(shops ?? []) as { id: string; shop_name: string }[]}
        />
      </section>

      <section className="mt-6 rounded-[24px] border border-stone-200 bg-white px-6 py-7 shadow-sm sm:px-9 sm:py-9">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-green-800">
            PRODUCT IMAGES
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-900">
            商品画像管理
          </h2>
        </div>

        <div className="mt-6">
          <ProductImageManager
            productId={Number(product.id)}
            productName={product.product_name ?? "商品"}
            initialImages={
              (product.exhibition_images ??
                []) as unknown as ManagedProductImage[]
            }
          />
        </div>
      </section>
    </div>
  );
}
