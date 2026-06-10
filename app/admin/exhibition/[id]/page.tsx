import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImageUploadForm from "./image-upload-form";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

const statusLabel: Record<string, string> = {
  preparing: "準備中",
  selling: "販売中",
  sold: "売約済",
};

const statusStyle: Record<string, string> = {
  preparing: "bg-yellow-100 text-yellow-800 border-yellow-300",
  selling: "bg-green-100 text-green-800 border-green-300",
  sold: "bg-red-100 text-red-800 border-red-300",
};

export default async function ExhibitionItemDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};

  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("exhibition_items")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (itemError || !item) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">商品が見つかりません</h1>
        <Link
          href="/admin/exhibition"
          className="mt-4 inline-block rounded border px-4 py-2"
        >
          一覧へ戻る
        </Link>
      </div>
    );
  }

  const { data: images } = await supabase
    .from("exhibition_images")
    .select("*")
    .eq("item_id", item.id)
    .order("sort_order", { ascending: true });

  const { data: orders } = await supabase
    .from("exhibition_orders")
    .select("*")
    .eq("item_id", item.id)
    .order("id", { ascending: false });

  const imageList = images ?? [];
  const orderList = orders ?? [];
  const securedOrder = orderList.find((order: any) => order.status === "secured");

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/admin/exhibition"
        className="inline-block rounded border px-4 py-2 text-sm"
      >
        ← 一覧へ戻る
      </Link>

      {query.success === "status" && (
        <div className="rounded-lg bg-green-50 p-4 font-bold text-green-700">
          状態を変更しました。
        </div>
      )}

      {query.success === "image-delete" && (
        <div className="rounded-lg bg-green-50 p-4 font-bold text-green-700">
          写真を削除しました。
        </div>
      )}

      {query.error && (
        <div className="rounded-lg bg-red-50 p-4 font-bold text-red-600">
          処理に失敗しました。
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">商品詳細</h1>
        <p className="mt-1 text-sm text-gray-500">
          商品情報・写真・販売状態・確保者を確認します。
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">商品情報</h2>

          <span
            className={`rounded-full border px-4 py-2 text-sm font-bold ${
              statusStyle[item.status] ??
              "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {statusLabel[item.status] ?? item.status}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div><strong>商品番号：</strong>{item.item_no}</div>
          <div><strong>商品名：</strong>{item.product_name}</div>
          <div><strong>規格：</strong>{item.spec || "-"}</div>
          <div><strong>数量：</strong>{item.quantity ?? "-"}</div>
          <div><strong>価格：</strong>¥{Number(item.price ?? 0).toLocaleString()}</div>
          <div><strong>産地：</strong>{item.origin || "-"}</div>
          <div><strong>生産者：</strong>{item.producer || "-"}</div>
          <div><strong>担当者：</strong>{item.staff || "-"}</div>
          <div className="md:col-span-2">
            <strong>コメント：</strong>{item.comment || "-"}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">確保状況</h2>

        {securedOrder ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="mb-2 font-bold text-red-800">この商品は確保済みです</p>
            <div className="space-y-1 text-sm">
              <p><strong>買参番号：</strong>{securedOrder.buyer_no}-{securedOrder.branch}</p>
              <p><strong>店名：</strong>{securedOrder.buyer_name}</p>
              <p><strong>連絡先：</strong>{securedOrder.contact}</p>
              <p><strong>数量：</strong>{securedOrder.quantity ?? 1}</p>
              {securedOrder.created_at && (
                <p>
                  <strong>確保日時：</strong>
                  {new Date(securedOrder.created_at).toLocaleString("ja-JP")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-gray-50 p-4 text-gray-500">
            現在、この商品の確保情報はありません。
          </div>
        )}

        {orderList.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 font-bold">履歴</h3>
            <div className="space-y-2">
              {orderList.map((order: any) => (
                <div key={order.id} className="rounded border bg-white p-3 text-sm">
                  <p>
                    <strong>{order.status}</strong> / {order.buyer_no}-{order.branch} /{" "}
                    {order.buyer_name} / {order.contact}
                  </p>
                  {order.created_at && (
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString("ja-JP")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">販売状態変更</h2>

        <div className="flex flex-wrap gap-3">
          <form action={`/api/admin/exhibition/items/${item.id}/status`} method="POST">
            <input type="hidden" name="status" value="selling" />
            <button type="submit" className="rounded-lg bg-green-700 px-5 py-3 font-bold text-white">
              販売中に戻す
            </button>
          </form>

          <form action={`/api/admin/exhibition/items/${item.id}/status`} method="POST">
            <input type="hidden" name="status" value="sold" />
            <button type="submit" className="rounded-lg bg-red-700 px-5 py-3 font-bold text-white">
              売約済にする
            </button>
          </form>

          <form action={`/api/admin/exhibition/items/${item.id}/status`} method="POST">
            <input type="hidden" name="status" value="preparing" />
            <button type="submit" className="rounded-lg bg-yellow-500 px-5 py-3 font-bold text-white">
              準備中に戻す
            </button>
          </form>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          売約取消したい場合は「販売中に戻す」を押してください。
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">写真</h2>
          <p className="text-sm text-gray-500">登録枚数：{imageList.length}枚</p>
        </div>

        {imageList.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {imageList.map((image, index) => (
              <div key={image.id} className="space-y-2 rounded-lg border bg-gray-50 p-2">
                <div className="overflow-hidden rounded-lg border bg-gray-100">
                  <img
                    src={image.image_url}
                    alt={`${item.product_name} 写真${index + 1}`}
                    className="h-40 w-full object-cover"
                  />
                </div>

                <p className="text-center text-xs text-gray-500">
                  画像 {index + 1}
                </p>

                <form
                  action={`/api/admin/exhibition/images/${image.id}`}
                  method="POST"
                >
                  <input type="hidden" name="item_id" value={item.id} />
                  <button
                    type="submit"
                    className="w-full rounded bg-red-600 px-3 py-2 text-sm font-bold text-white"
                  >
                    削除
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center text-gray-500">
            写真はまだ登録されていません。
          </div>
        )}

        <div className="mt-6 border-t pt-6">
          <h3 className="mb-3 font-bold">写真を追加</h3>
          <ImageUploadForm itemId={item.id} />
        </div>
      </div>
    </div>
  );
}