import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import EditItemForm from "./edit-item-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExhibitionItemEditPage({ params }: Props) {
  const { id } = await params;
  const itemId = Number(id);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">商品が見つかりません</h1>

        <Link
          href="/admin/exhibition"
          className="mt-4 inline-block rounded border px-4 py-2 transition hover:bg-gray-50"
        >
          一覧へ戻る
        </Link>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("exhibition_items")
    .select(
      `
        id,
        item_no,
        product_name,
        category,
        item,
        variety,
        tree_height,
        tree_shape,
        pot_size,
        quantity,
        price,
        origin,
        producer,
        staff,
        comment,
        jf_code
      `
    )
    .eq("id", itemId)
    .single();

  if (error || !item) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">商品が見つかりません</h1>

        <Link
          href="/admin/exhibition"
          className="mt-4 inline-block rounded border px-4 py-2 transition hover:bg-gray-50"
        >
          一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Link
        href={`/admin/exhibition/${item.id}`}
        className="inline-block rounded border px-4 py-2 text-sm transition hover:bg-gray-50"
      >
        ← 商品詳細へ戻る
      </Link>

      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-green-700">
          Lei Port Standard
        </p>

        <h1 className="mt-1 text-3xl font-bold">商品情報編集</h1>

        <p className="mt-1 text-sm text-gray-500">
          LPSに基づく商品情報を編集します。
        </p>
      </div>

      <EditItemForm item={item} />
    </div>
  );
}