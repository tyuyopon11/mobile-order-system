import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import ImageUploadForm from "./image-upload-form";

type Props = {
  params: Promise<{
    id: string;
  }>;

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
  preparing: "border-yellow-300 bg-yellow-100 text-yellow-800",
  selling: "border-green-300 bg-green-100 text-green-800",
  sold: "border-red-300 bg-red-100 text-red-800",
};

function displayValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
}

export default async function ExhibitionItemDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};

  const itemId = Number(id);

  if (!Number.isInteger(itemId) || itemId <= 0) {
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

  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("exhibition_items")
    .select("*")
    .eq("id", itemId)
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
    .order("sort_order", {
      ascending: true,
    });

  const { data: orders } = await supabase
    .from("exhibition_orders")
    .select("*")
    .eq("item_id", item.id)
    .order("id", {
      ascending: false,
    });

  const imageList = images ?? [];
  const orderList = orders ?? [];

  const securedOrder = orderList.find(
    (order: any) => order.status === "secured"
  );

  const inputCompleted = item.input_completed === true;

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/admin/exhibition"
        className="inline-block rounded border px-4 py-2 text-sm transition hover:bg-gray-50"
      >
        ← 一覧へ戻る
      </Link>

      {query.success === "status" && (
        <div className="rounded-lg bg-green-50 p-4 font-bold text-green-700">
          状態を変更しました。
        </div>
      )}

      {query.success === "input_completed" && (
        <div className="rounded-lg bg-blue-50 p-4 font-bold text-blue-700">
          入力済み状態を変更しました。
        </div>
      )}

      {query.success === "image-delete" && (
        <div className="rounded-lg bg-green-50 p-4 font-bold text-green-700">
          写真を削除しました。
        </div>
      )}

      {query.success === "update" && (
        <div className="rounded-lg bg-green-50 p-4 font-bold text-green-700">
          商品情報を更新しました。
        </div>
      )}

      {query.error && (
        <div className="rounded-lg bg-red-50 p-4 font-bold text-red-600">
          処理に失敗しました。
        </div>
      )}

      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-green-700">
          Lei Port Standard
        </p>

        <h1 className="mt-1 text-3xl font-bold">商品詳細</h1>

        <p className="mt-1 text-sm text-gray-500">
          商品情報・写真・販売状態・確保者を確認します。
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">LPS商品情報</h2>

            <p className="mt-1 text-sm text-gray-500">
              Lei Port Standardに基づいて情報を分類しています。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/exhibition/${item.id}/edit`}
              className="rounded-lg bg-green-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-green-800"
            >
              商品情報を編集
            </Link>

            <span
              className={`rounded-full border px-4 py-2 text-sm font-bold ${
                statusStyle[item.status] ??
                "border-gray-300 bg-gray-100 text-gray-700"
              }`}
            >
              {statusLabel[item.status] ?? item.status}
            </span>

            {inputCompleted && (
              <span className="rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-bold text-blue-800">
                入力済
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="rounded-xl border border-green-100 bg-green-50/50 p-5">
            <h3 className="mb-4 text-lg font-bold text-green-900">
              基本情報
            </h3>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold text-gray-500">商品番号</dt>
                <dd className="mt-1 font-bold text-gray-900">
                  {displayValue(item.item_no)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">商品名</dt>
                <dd className="mt-1 font-bold text-gray-900">
                  {displayValue(item.product_name)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">
                  カテゴリー
                </dt>
                <dd className="mt-1 text-gray-900">
                  {displayValue(item.category)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">品目</dt>
                <dd className="mt-1 text-gray-900">
                  {displayValue(item.item)}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-bold text-gray-500">品種</dt>
                <dd className="mt-1 text-gray-900">
                  {displayValue(item.variety)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
            <h3 className="mb-4 text-lg font-bold text-emerald-900">
              植物情報
            </h3>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-bold text-gray-500">樹高</dt>
                <dd className="mt-1 font-bold text-gray-900">
                  {displayValue(item.tree_height)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">樹形</dt>
                <dd className="mt-1 font-bold text-gray-900">
                  {displayValue(item.tree_shape)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">
                  鉢サイズ
                </dt>
                <dd className="mt-1 font-bold text-gray-900">
                  {displayValue(item.pot_size)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
            <h3 className="mb-4 text-lg font-bold text-blue-900">
              販売情報
            </h3>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold text-gray-500">数量</dt>
                <dd className="mt-1 font-bold text-gray-900">
                  {displayValue(item.quantity)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">
                  販売価格（税抜）
                </dt>
                <dd className="mt-1 text-xl font-bold text-green-700">
                  {item.price !== undefined &&
                  item.price !== null &&
                  item.price !== ""
                    ? `¥${Number(item.price).toLocaleString()}`
                    : "-"}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-bold text-gray-500">コメント</dt>
                <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                  {displayValue(item.comment)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
            <h3 className="mb-4 text-lg font-bold text-amber-900">
              生産・管理情報
            </h3>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold text-gray-500">産地</dt>
                <dd className="mt-1 text-gray-900">
                  {displayValue(item.origin)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">生産者</dt>
                <dd className="mt-1 text-gray-900">
                  {displayValue(item.producer)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">担当者</dt>
                <dd className="mt-1 text-gray-900">
                  {displayValue(item.staff)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold text-gray-500">JFコード</dt>
                <dd className="mt-1 text-gray-900">
                  {displayValue(item.jf_code)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-gray-500">
              JFコードは業界標準との内部連携に使用する任意項目です。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">確保状況</h2>

        {securedOrder ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <p className="mb-2 font-bold text-red-800">
                この商品は確保済みです
              </p>

              <div className="space-y-1 text-sm">
                <p>
                  <strong>買参番号：</strong>
                  {securedOrder.buyer_no}-{securedOrder.branch}
                </p>

                <p>
                  <strong>店名：</strong>
                  {securedOrder.buyer_name}
                </p>

                <p>
                  <strong>連絡先：</strong>
                  {securedOrder.contact}
                </p>

                <p>
                  <strong>数量：</strong>
                  {securedOrder.quantity ?? 1}
                </p>

                {securedOrder.created_at && (
                  <p>
                    <strong>確保日時：</strong>
                    {new Date(securedOrder.created_at).toLocaleString("ja-JP")}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
              <p className="mb-3 font-bold text-blue-800">営業入力状況</p>

              {inputCompleted ? (
                <div className="space-y-3">
                  <p className="font-bold text-blue-700">入力済みです。</p>

                  <form
                    action={`/api/admin/exhibition/items/${item.id}/status`}
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="action"
                      value="input_completed"
                    />

                    <input
                      type="hidden"
                      name="input_completed"
                      value="false"
                    />

                    <button
                      type="submit"
                      className="rounded-lg bg-gray-700 px-5 py-3 font-bold text-white transition hover:bg-gray-800"
                    >
                      入力済みを解除
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    AS・売立入力が終わったら押してください。
                  </p>

                  <form
                    action={`/api/admin/exhibition/items/${item.id}/status`}
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="action"
                      value="input_completed"
                    />

                    <input
                      type="hidden"
                      name="input_completed"
                      value="true"
                    />

                    <button
                      type="submit"
                      className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
                    >
                      入力済みにする
                    </button>
                  </form>
                </div>
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
                <div
                  key={order.id}
                  className="rounded border bg-white p-3 text-sm"
                >
                  <p>
                    <strong>{order.status}</strong> / {order.buyer_no}-
                    {order.branch} / {order.buyer_name} / {order.contact}
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
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">販売状態変更</h2>

        <div className="flex flex-wrap gap-3">
          <form
            action={`/api/admin/exhibition/items/${item.id}/status`}
            method="POST"
          >
            <input type="hidden" name="status" value="selling" />

            <button
              type="submit"
              className="rounded-lg bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800"
            >
              販売中に戻す
            </button>
          </form>

          <form
            action={`/api/admin/exhibition/items/${item.id}/status`}
            method="POST"
          >
            <input type="hidden" name="status" value="sold" />

            <button
              type="submit"
              className="rounded-lg bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800"
            >
              売約済にする
            </button>
          </form>

          <form
            action={`/api/admin/exhibition/items/${item.id}/status`}
            method="POST"
          >
            <input type="hidden" name="status" value="preparing" />

            <button
              type="submit"
              className="rounded-lg bg-yellow-500 px-5 py-3 font-bold text-white transition hover:bg-yellow-600"
            >
              準備中に戻す
            </button>
          </form>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          売約取消したい場合は「販売中に戻す」を押してください。
          販売中・準備中へ戻すと入力済みも解除されます。
        </p>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">写真</h2>

            <p className="mt-1 text-sm text-gray-500">
              メイン画像1枚とサブ画像最大5枚を基準とします。
            </p>
          </div>

          <p className="text-sm text-gray-500">
            登録枚数：{imageList.length}枚
          </p>
        </div>

        {imageList.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {imageList.map((image, index) => (
              <div
                key={image.id}
                className="space-y-2 rounded-lg border bg-gray-50 p-2"
              >
                <div className="overflow-hidden rounded-lg border bg-gray-100">
                  <img
                    src={image.image_url}
                    alt={`${item.product_name} 写真${index + 1}`}
                    className="h-40 w-full object-cover"
                  />
                </div>

                <p className="text-center text-xs font-bold text-gray-500">
                  {index === 0 ? "メイン画像" : `サブ画像 ${index}`}
                </p>

                <form
                  action={`/api/admin/exhibition/images/${image.id}`}
                  method="POST"
                >
                  <input type="hidden" name="item_id" value={item.id} />

                  <button
                    type="submit"
                    className="w-full rounded bg-red-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-700"
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
      </section>
    </div>
  );
}
