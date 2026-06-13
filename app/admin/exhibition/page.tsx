import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  staff?: string;
  status?: string;
  noPhoto?: string;
  page?: string;
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

  const pageSize = 30;
  const currentPage = Math.max(Number(params.page || "1"), 1);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: countItems } = await supabase
    .from("exhibition_items")
    .select(`
      id,
      staff,
      status,
      input_completed,
      exhibition_images (
        id
      )
    `);

  const allCountItems = countItems ?? [];

  const staffList = Array.from(
    new Set(allCountItems.map((item: any) => item.staff).filter(Boolean))
  ).sort();

  const counts = {
    total: allCountItems.length,
    preparing: allCountItems.filter((item: any) => item.status === "preparing").length,
    selling: allCountItems.filter((item: any) => item.status === "selling").length,
    sold: allCountItems.filter((item: any) => item.status === "sold").length,
    inputCompleted: allCountItems.filter((item: any) => item.input_completed === true).length,
    noPhoto: allCountItems.filter((item: any) => (item.exhibition_images ?? []).length === 0).length,
  };

  let filteredCountItems = allCountItems.filter((item: any) => {
    const images = item.exhibition_images ?? [];

    if (selectedStaff && item.staff !== selectedStaff) return false;
    if (selectedStatus && item.status !== selectedStatus) return false;
    if (noPhotoOnly && images.length > 0) return false;

    return true;
  });

  const totalCount = filteredCountItems.length;
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);

  let itemQuery = supabase
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
      input_completed,
      exhibition_images (
        id,
        sort_order
      )
    `)
    .order("item_no", { ascending: true });

  if (selectedStaff) {
    itemQuery = itemQuery.eq("staff", selectedStaff);
  }

  if (selectedStatus) {
    itemQuery = itemQuery.eq("status", selectedStatus);
  }

  const { data: rawItems, error } = await itemQuery;

  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-600">商品一覧の取得に失敗しました。</p>
        <pre className="mt-4 text-xs">{error.message}</pre>
      </main>
    );
  }

  const filteredItems = (rawItems ?? [])
    .filter((item: any) => {
      const images = item.exhibition_images ?? [];
      if (noPhotoOnly && images.length > 0) return false;
      return true;
    })
    .slice(from, to + 1);

  const buildUrl = (urlParams: Record<string, string>) => {
    const query = new URLSearchParams();

    if (urlParams.staff) query.set("staff", urlParams.staff);
    if (urlParams.status) query.set("status", urlParams.status);
    if (urlParams.noPhoto) query.set("noPhoto", urlParams.noPhoto);
    if (urlParams.page) query.set("page", urlParams.page);

    const qs = query.toString();
    return qs ? `/admin/exhibition?${qs}` : "/admin/exhibition";
  };

  const createPageUrl = (page: number) =>
    buildUrl({
      staff: selectedStaff,
      status: selectedStatus,
      noPhoto: noPhotoOnly ? "1" : "",
      page: String(page),
    });

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
          <Link href="/admin/exhibition/orders" className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white">
            売約一覧
          </Link>

          <Link href="/admin/exhibition/import" className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white">
            Excel取込
          </Link>

          <Link href="/exhibition" target="_blank" className="rounded-lg bg-green-700 px-4 py-2 font-bold text-white">
            買参人画面
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">商品数</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>

        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800 font-bold">準備中</p>
          <p className="text-2xl font-bold text-yellow-900">{counts.preparing}</p>
        </div>

        <div className="rounded-lg border border-green-300 bg-green-50 p-4">
          <p className="text-sm text-green-800 font-bold">販売中</p>
          <p className="text-2xl font-bold text-green-900">{counts.selling}</p>
        </div>

        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-800 font-bold">売約済</p>
          <p className="text-2xl font-bold text-red-900">{counts.sold}</p>
        </div>

        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
          <p className="text-sm text-blue-800 font-bold">入力済</p>
          <p className="text-2xl font-bold text-blue-900">{counts.inputCompleted}</p>
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
            <select name="staff" defaultValue={selectedStaff} className="border rounded px-3 py-2">
              <option value="">全員</option>
              {staffList.map((staff: any) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">状態</label>
            <select name="status" defaultValue={selectedStatus} className="border rounded px-3 py-2">
              <option value="">すべて</option>
              <option value="preparing">準備中</option>
              <option value="selling">販売中</option>
              <option value="sold">売約済</option>
            </select>
          </div>

          <label className="flex items-center gap-2 border rounded px-3 py-2">
            <input type="checkbox" name="noPhoto" value="1" defaultChecked={noPhotoOnly} />
            未撮影のみ
          </label>

          <button type="submit" className="bg-black text-white rounded px-4 py-2">
            絞り込み
          </button>

          <Link href="/admin/exhibition" className="border rounded px-4 py-2 text-sm">
            リセット
          </Link>
        </form>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={buildUrl({ staff: selectedStaff, status: "", noPhoto: "", page: "1" })} className="border rounded px-3 py-1">
            全件
          </Link>

          <Link href={buildUrl({ staff: selectedStaff, status: "preparing", noPhoto: "", page: "1" })} className="border border-yellow-300 bg-yellow-50 text-yellow-800 rounded px-3 py-1 font-bold">
            準備中
          </Link>

          <Link href={buildUrl({ staff: selectedStaff, status: "selling", noPhoto: "", page: "1" })} className="border border-green-300 bg-green-50 text-green-800 rounded px-3 py-1 font-bold">
            販売中
          </Link>

          <Link href={buildUrl({ staff: selectedStaff, status: "sold", noPhoto: "", page: "1" })} className="border border-red-300 bg-red-50 text-red-800 rounded px-3 py-1 font-bold">
            売約済
          </Link>

          <Link href={buildUrl({ staff: selectedStaff, status: selectedStatus, noPhoto: "1", page: "1" })} className="border rounded px-3 py-1">
            未撮影
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
        <p>
          表示対象：<span className="font-bold">{totalCount}</span> 件
        </p>
        <p>
          {currentPage} / {totalPages} ページ（1ページ30件）
        </p>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
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
              <th className="p-2 text-left">入力</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item: any) => {
              const images = item.exhibition_images ?? [];
              const photoCount = images.length;
              const displayPhotoCount = Math.min(photoCount, 3);

              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${photoCountStyle(photoCount)}`}>
                      {displayPhotoCount}/3
                    </span>
                  </td>

                  <td className="p-2">{item.item_no}</td>

                  <td className="p-2 font-medium">
                    <Link href={`/admin/exhibition/${item.id}`} className="text-blue-600 hover:underline">
                      {item.product_name}
                    </Link>
                  </td>

                  <td className="p-2">{item.spec}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">{item.price?.toLocaleString()}円</td>
                  <td className="p-2">{item.origin}</td>
                  <td className="p-2">{item.producer}</td>
                  <td className="p-2">{item.staff}</td>

                  <td className="p-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      statusStyle[item.status] ?? "bg-gray-100 text-gray-700 border-gray-300"
                    }`}>
                      {statusLabel[item.status] ?? item.status}
                    </span>
                  </td>

                  <td className="p-2">
                    {item.input_completed ? (
                      <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                        入力済
                      </span>
                    ) : item.status === "sold" ? (
                      <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                        未入力
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
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

      {totalCount > 0 && (
        <div className="flex items-center justify-center gap-3 rounded-lg border bg-white p-4">
          {currentPage > 1 ? (
            <Link href={createPageUrl(currentPage - 1)} className="rounded bg-gray-200 px-5 py-2 font-bold">
              前へ
            </Link>
          ) : (
            <span className="rounded bg-gray-100 px-5 py-2 font-bold text-gray-400">
              前へ
            </span>
          )}

          <span className="font-bold text-gray-600">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link href={createPageUrl(currentPage + 1)} className="rounded bg-green-700 px-5 py-2 font-bold text-white">
              次へ
            </Link>
          ) : (
            <span className="rounded bg-gray-100 px-5 py-2 font-bold text-gray-400">
              次へ
            </span>
          )}
        </div>
      )}
    </main>
  );
}