import Link from "next/link";
import { notFound } from "next/navigation";

import { getShopById } from "@/lib/services/shop";

import EditShopForm from "./EditShopForm";
import ShopImageManager from "./ShopImageManager";

type EditShopPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditShopPage({ params }: EditShopPageProps) {
  const { id } = await params;
  const shop = await getShopById(id);

  if (!shop) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/platform/admin/shops"
        className="inline-flex text-sm font-medium text-stone-500 transition hover:text-green-800"
      >
        ← ショップ一覧へ戻る
      </Link>

      <section className="mt-4 rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          EDIT SHOP
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          ショップ編集
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-500 sm:text-base">
          {shop.shop_name}の基本情報と公開設定を編集します。
        </p>
      </section>

      <section className="mt-6 rounded-[24px] border border-stone-200 bg-white px-6 py-7 shadow-sm sm:px-9 sm:py-9">
        <EditShopForm shop={shop} />
      </section>

      <section className="mt-6 rounded-[24px] border border-stone-200 bg-white px-6 py-7 shadow-sm sm:px-9 sm:py-9">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-green-800">
            SHOP IMAGES
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-900">
            ロゴ・バナー管理
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            ショップページと一覧に使用する画像を登録・変更・削除できます。
          </p>
        </div>

        <ShopImageManager
          shopId={shop.id}
          shopName={shop.shop_name}
          initialLogoUrl={shop.logo_url}
          initialBannerUrl={shop.banner_url}
        />
      </section>
    </div>
  );
}
