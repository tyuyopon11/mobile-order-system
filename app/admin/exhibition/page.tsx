import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  staff?: string;
  status?: string;
  noPhoto?: string;
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

function photoCountStyle(count: number) {
  if (count === 0) return "bg-red-100 text-red-800 border-red-300";
  if (count < 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-green-100 text-green-800 border-green-300";
}

export default async function ExhibitionAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const selectedStaff = params.staff || "";
  const selectedStatus = params.status || "";
  const noPhotoOnly = params.noPhoto === "1";

  const { data: items, error } = await supabase
    .from("exhibition_items")
    .select(`
      id,
      item_no,
      product_name,
      spec,
      quantity,
      price,
      origin,
      producer,
      staff,
      status,
      exhibition_images (
        id,
        image_url,
        sort_order
      )
    `)
    .order("item_no", { ascending: true });

  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-600">商品一覧の取得に失敗しました。</p>
        <pre className="mt-4 text-xs">{error.message}</pre>
      </main>
    );
  }

  const allItems = items ?? [];

  const staffList = Array.from(
    new Set(allItems.map((item) => item.staff).filter(Boolean))
  ).sort();

  const filteredItems = allItems.filter((item) => {
    const images = item.exhibition_images ?? [];

    if (selectedStaff && item.staff !== selectedStaff) return false;
    if (selectedStatus && item.status !== selectedStatus) return false;
    if (noPhotoOnly && images.length > 0) return false;

    return true;
  });

  const counts = {
    total: allItems.length,
    preparing: allItems.filter((item) => item.status === "preparing").length,
    selling: allItems.filter((item) => item.status === "selling").length,
    sold: allItems.filter((item) => item.status === "sold").length,
    noPhoto: allItems.filter((item) => (item.exhibition_images ?? []).length === 0)
      .length,
  };

  const buildUrl = (urlParams: Record<string, string>) => {
    const query = new URLSearchParams();

    if (urlParams.staff) query.set("staff", urlParams.staff);
    if (urlParams.status) query.set("status", urlParams.status);
    if (urlParams.noPhoto) query.set("noPhoto", urlParams.noPhoto);

    const qs = query.toString();
    return qs ? `/admin/exhibition?${qs}` : "/admin/exhibition";
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">園芸部WEB展示販売 管理画面</h1>
          <p className="text-sm text-gray-500 mt-1">
            商品一覧・撮影状況・販売状況を管理します。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/exhibition/import"
            className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white"
          >
            Excel取込
          </Link>

          <Link
            href="/exhibition"
            target="_blank"
            className="rounded-lg bg-green-700 px-4 py-2 font-bold text-white"
          >
            買参人画面
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">商品数</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>

        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800 font-bold">準備中</p>
          <p className="text-2xl font-bold text-yellow-900">
            {counts.preparing}
          </p>
        </div>

        <div className="rounded-lg border border-green-300 bg-green-50 p-4">
          <p className="text-sm text-green-800 font-bold">販売中</p>
          <p className="text-2xl font-bold text-green-900">{counts.selling}</p>
        </div>

        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-800 font-bold">売約済</p>
          <p className="text-2xl font-bold text-red-900">{counts.sold}</p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">未撮影</p>
          <p className="text-2xl font-bold">{counts.noPhoto}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 space-y-4">
        <h2 className="font-bold">フィルタ</h2>

        <form className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">担当者</label>
            <select
              name="staff"
              defaultValue={selectedStaff}
              className="border rounded px-3 py-2"
            >
              <option value="">全員</option>
              {staffList.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">状態</label>
            <select
              name="status"
              defaultValue={selectedStatus}
              className="border rounded px-3 py-2"
            >
              <option value="">すべて</option>
              <option value="preparing">準備中</option>
              <option value="selling">販売中</option>
              <option value="sold">売約済</option>
            </select>
          </div>

          <label className="flex items-center gap-2 border rounded px-3 py-2">
            <input
              type="checkbox"
              name="noPhoto"
              value="1"
              defaultChecked={noPhotoOnly}
            />
            未撮影のみ
          </label>

          <button
            type="submit"
            className="bg-black text-white rounded px-4 py-2"
          >
            絞り込み
          </button>

          <Link
            href="/admin/exhibition"
            className="border rounded px-4 py-2 text-sm"
          >
            リセット
          </Link>
        </form>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href={buildUrl({ staff: selectedStaff, status: "", noPhoto: "" })}
            className="border rounded px-3 py-1"
          >
            全件
          </Link>

          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: "preparing",
              noPhoto: "",
            })}
            className="border border-yellow-300 bg-yellow-50 text-yellow-800 rounded px-3 py-1 font-bold"
          >
            準備中
          </Link>

          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: "selling",
              noPhoto: "",
            })}
            className="border border-green-300 bg-green-50 text-green-800 rounded px-3 py-1 font-bold"
          >
            販売中
          </Link>

          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: "sold",
              noPhoto: "",
            })}
            className="border border-red-300 bg-red-50 text-red-800 rounded px-3 py-1 font-bold"
          >
            売約済
          </Link>

          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: selectedStatus,
              noPhoto: "1",
            })}
            className="border rounded px-3 py-1"
          >
            未撮影
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">写真</th>
              <th className="p-2 text-left">枚数</th>
              <th className="p-2 text-left">No</th>
              <th className="p-2 text-left">商品名</th>
              <th className="p-2 text-left">規格</th>
              <th className="p-2 text-right">数量</th>
              <th className="p-2 text-right">価格</th>
              <th className="p-2 text-left">産地</th>
              <th className="p-2 text-left">生産者</th>
              <th className="p-2 text-left">担当</th>
              <th className="p-2 text-left">状態</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => {
              const images = item.exhibition_images ?? [];
              const sortedImages = [...images].sort(
                (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
              );
              const thumbnail = sortedImages[0];
              const photoCount = images.length;
              const displayPhotoCount = Math.min(photoCount, 3);

              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {thumbnail?.image_url ? (
                      <img
                        src={thumbnail.image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        未撮影
                      </div>
                    )}
                  </td>

                  <td className="p-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${photoCountStyle(
                        photoCount
                      )}`}
                    >
                      {displayPhotoCount}/3
                    </span>
                  </td>

                  <td className="p-2">{item.item_no}</td>

                  <td className="p-2 font-medium">
                    <Link
                      href={`/admin/exhibition/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.product_name}
                    </Link>
                  </td>

                  <td className="p-2">{item.spec}</td>
                  <td className="p-2 text-right">{item.quantity}</td>

                  <td className="p-2 text-right">
                    {item.price?.toLocaleString()}円
                  </td>

                  <td className="p-2">{item.origin}</td>
                  <td className="p-2">{item.producer}</td>
                  <td className="p-2">{item.staff}</td>

                  <td className="p-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        statusStyle[item.status] ??
                        "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {statusLabel[item.status] ?? item.status}
                    </span>
                  </td>
                </tr>
              );
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={11} className="p-6 text-center text-gray-500">
                  該当する商品がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}