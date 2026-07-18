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
  preparing: "border-yellow-300 bg-yellow-100 text-yellow-800",
  selling: "border-green-300 bg-green-100 text-green-800",
  sold: "border-red-300 bg-red-100 text-red-800",
};

function photoCountStyle(count: number) {
  if (count === 0) {
    return "border-red-300 bg-red-100 text-red-800";
  }

  return "border-green-300 bg-green-100 text-green-800";
}

function displayValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
}

function createClassificationText(item: any) {
  const values = [
    item.category,
    item.item,
    item.variety,
  ].filter(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

  return values.length > 0 ? values.join(" ＞ ") : "-";
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

  const { data: countItems, error: countError } = await supabase
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

  if (countError) {
    return (
      <main className="p-6">
        <p className="font-bold text-red-600">
          商品集計の取得に失敗しました。
        </p>

        <pre className="mt-4 whitespace-pre-wrap text-xs text-red-500">
          {countError.message}
        </pre>
      </main>
    );
  }

  const allCountItems = countItems ?? [];

  const staffList = Array.from(
    new Set(
      allCountItems
        .map((item: any) => item.staff)
        .filter(
          (staff) =>
            staff !== undefined &&
            staff !== null &&
            String(staff).trim() !== ""
        )
    )
  ).sort((a, b) => String(a).localeCompare(String(b), "ja"));

  const counts = {
    total: allCountItems.length,

    preparing: allCountItems.filter(
      (item: any) => item.status === "preparing"
    ).length,

    selling: allCountItems.filter(
      (item: any) => item.status === "selling"
    ).length,

    sold: allCountItems.filter(
      (item: any) => item.status === "sold"
    ).length,

    inputCompleted: allCountItems.filter(
      (item: any) => item.input_completed === true
    ).length,

    noPhoto: allCountItems.filter(
      (item: any) =>
        (item.exhibition_images ?? []).length === 0
    ).length,
  };

  const filteredCountItems = allCountItems.filter((item: any) => {
    const images = item.exhibition_images ?? [];

    if (selectedStaff && item.staff !== selectedStaff) {
      return false;
    }

    if (selectedStatus && item.status !== selectedStatus) {
      return false;
    }

    if (noPhotoOnly && images.length > 0) {
      return false;
    }

    return true;
  });

  const totalCount = filteredCountItems.length;
  const totalPages = Math.max(
    Math.ceil(totalCount / pageSize),
    1
  );

  let itemQuery = supabase
    .from("exhibition_items")
    .select(`
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
      status,
      input_completed,
      exhibition_images (
        id,
        sort_order
      )
    `)
    .order("item_no", {
      ascending: true,
    });

  if (selectedStaff) {
    itemQuery = itemQuery.eq("staff", selectedStaff);
  }

  if (selectedStatus) {
    itemQuery = itemQuery.eq("status", selectedStatus);
  }

  const { data: rawItems, error: itemError } =
    await itemQuery;

  if (itemError) {
    return (
      <main className="p-6">
        <p className="font-bold text-red-600">
          商品一覧の取得に失敗しました。
        </p>

        <pre className="mt-4 whitespace-pre-wrap text-xs text-red-500">
          {itemError.message}
        </pre>
      </main>
    );
  }

  const filteredItems = (rawItems ?? [])
    .filter((item: any) => {
      const images = item.exhibition_images ?? [];

      if (noPhotoOnly && images.length > 0) {
        return false;
      }

      return true;
    })
    .slice(from, to + 1);

  const buildUrl = (
    urlParams: Record<string, string>
  ) => {
    const query = new URLSearchParams();

    if (urlParams.staff) {
      query.set("staff", urlParams.staff);
    }

    if (urlParams.status) {
      query.set("status", urlParams.status);
    }

    if (urlParams.noPhoto) {
      query.set("noPhoto", urlParams.noPhoto);
    }

    if (urlParams.page) {
      query.set("page", urlParams.page);
    }

    const queryString = query.toString();

    return queryString
      ? `/admin/exhibition?${queryString}`
      : "/admin/exhibition";
  };

  const createPageUrl = (page: number) =>
    buildUrl({
      staff: selectedStaff,
      status: selectedStatus,
      noPhoto: noPhotoOnly ? "1" : "",
      page: String(page),
    });

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-green-700">
            Lei Port Standard
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            園芸部WEB展示販売 管理画面
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            LPSに基づいて商品・植物情報・撮影状況・販売状況を管理します。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/exhibition/orders"
            className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white transition hover:bg-purple-800"
          >
            売約一覧
          </Link>

          <Link
            href="/admin/exhibition/import"
            className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700"
          >
            Excel取込
          </Link>

          <Link
            href="/exhibition"
            target="_blank"
            className="rounded-lg bg-green-700 px-4 py-2 font-bold text-white transition hover:bg-green-800"
          >
            買参人画面
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            商品数
          </p>

          <p className="mt-1 text-2xl font-bold">
            {counts.total}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
          <p className="text-sm font-bold text-yellow-800">
            準備中
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-900">
            {counts.preparing}
          </p>
        </div>

        <div className="rounded-xl border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-bold text-green-800">
            販売中
          </p>

          <p className="mt-1 text-2xl font-bold text-green-900">
            {counts.selling}
          </p>
        </div>

        <div className="rounded-xl border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-800">
            売約済
          </p>

          <p className="mt-1 text-2xl font-bold text-red-900">
            {counts.sold}
          </p>
        </div>

        <div className="rounded-xl border border-blue-300 bg-blue-50 p-4">
          <p className="text-sm font-bold text-blue-800">
            入力済
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-900">
            {counts.inputCompleted}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            未撮影
          </p>

          <p className="mt-1 text-2xl font-bold">
            {counts.noPhoto}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-4">
        <div>
          <h2 className="font-bold">
            フィルター
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            担当者・販売状態・撮影状況から絞り込みます。
          </p>
        </div>

        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              担当者
            </label>

            <select
              name="staff"
              defaultValue={selectedStaff}
              className="rounded border px-3 py-2"
            >
              <option value="">全員</option>

              {staffList.map((staff) => (
                <option
                  key={String(staff)}
                  value={String(staff)}
                >
                  {String(staff)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              状態
            </label>

            <select
              name="status"
              defaultValue={selectedStatus}
              className="rounded border px-3 py-2"
            >
              <option value="">すべて</option>
              <option value="preparing">準備中</option>
              <option value="selling">販売中</option>
              <option value="sold">売約済</option>
            </select>
          </div>

          <label className="flex items-center gap-2 rounded border px-3 py-2">
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
            className="rounded bg-black px-4 py-2 font-bold text-white transition hover:bg-gray-800"
          >
            絞り込み
          </button>

          <Link
            href="/admin/exhibition"
            className="rounded border px-4 py-2 text-sm transition hover:bg-gray-50"
          >
            リセット
          </Link>
        </form>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: "",
              noPhoto: "",
              page: "1",
            })}
            className="rounded border px-3 py-1 transition hover:bg-gray-50"
          >
            全件
          </Link>

          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: "preparing",
              noPhoto: "",
              page: "1",
            })}
            className="rounded border border-yellow-300 bg-yellow-50 px-3 py-1 font-bold text-yellow-800"
          >
            準備中
          </Link>

          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: "selling",
              noPhoto: "",
              page: "1",
            })}
            className="rounded border border-green-300 bg-green-50 px-3 py-1 font-bold text-green-800"
          >
            販売中
          </Link>

          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: "sold",
              noPhoto: "",
              page: "1",
            })}
            className="rounded border border-red-300 bg-red-50 px-3 py-1 font-bold text-red-800"
          >
            売約済
          </Link>

          <Link
            href={buildUrl({
              staff: selectedStaff,
              status: selectedStatus,
              noPhoto: "1",
              page: "1",
            })}
            className="rounded border px-3 py-1 transition hover:bg-gray-50"
          >
            未撮影
          </Link>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4 text-sm text-gray-600">
        <p>
          表示対象：
          <span className="ml-1 font-bold">
            {totalCount}
          </span>
          件
        </p>

        <p className="mt-1">
          {currentPage} / {totalPages} ページ
          （1ページ30件）
        </p>
      </section>

      <section className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-[1180px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                写真
              </th>

              <th className="p-3 text-left">
                No
              </th>

              <th className="p-3 text-left">
                商品・分類
              </th>

              <th className="p-3 text-left">
                植物情報
              </th>

              <th className="p-3 text-right">
                数量
              </th>

              <th className="p-3 text-right">
                価格
              </th>

              <th className="p-3 text-left">
                生産情報
              </th>

              <th className="p-3 text-left">
                担当
              </th>

              <th className="p-3 text-left">
                状態
              </th>

              <th className="p-3 text-left">
                入力
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item: any) => {
              const images =
                item.exhibition_images ?? [];

              const photoCount = images.length;

              return (
                <tr
                  key={item.id}
                  className="border-t align-top transition hover:bg-gray-50"
                >
                  <td className="p-3">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${photoCountStyle(
                        photoCount
                      )}`}
                    >
                      {photoCount} / 6
                    </span>
                  </td>

                  <td className="p-3 font-bold">
                    {displayValue(item.item_no)}
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/admin/exhibition/${item.id}`}
                      className="font-bold text-blue-700 hover:underline"
                    >
                      {displayValue(
                        item.product_name
                      )}
                    </Link>

                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      {createClassificationText(
                        item
                      )}
                    </p>
                  </td>

                  <td className="p-3">
                    <dl className="space-y-1 text-xs">
                      <div className="flex gap-2">
                        <dt className="min-w-14 font-bold text-gray-500">
                          樹高
                        </dt>

                        <dd className="text-gray-900">
                          {displayValue(
                            item.tree_height
                          )}
                        </dd>
                      </div>

                      <div className="flex gap-2">
                        <dt className="min-w-14 font-bold text-gray-500">
                          樹形
                        </dt>

                        <dd className="text-gray-900">
                          {displayValue(
                            item.tree_shape
                          )}
                        </dd>
                      </div>

                      <div className="flex gap-2">
                        <dt className="min-w-14 font-bold text-gray-500">
                          鉢サイズ
                        </dt>

                        <dd className="text-gray-900">
                          {displayValue(
                            item.pot_size
                          )}
                        </dd>
                      </div>
                    </dl>
                  </td>

                  <td className="p-3 text-right font-bold">
                    {displayValue(item.quantity)}
                  </td>

                  <td className="p-3 text-right font-bold text-green-700">
                    {item.price !== undefined &&
                    item.price !== null &&
                    item.price !== ""
                      ? `¥${Number(
                          item.price
                        ).toLocaleString()}`
                      : "-"}
                  </td>

                  <td className="p-3">
                    <dl className="space-y-1 text-xs">
                      <div>
                        <dt className="font-bold text-gray-500">
                          産地
                        </dt>

                        <dd className="mt-0.5 text-gray-900">
                          {displayValue(
                            item.origin
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-bold text-gray-500">
                          生産者
                        </dt>

                        <dd className="mt-0.5 text-gray-900">
                          {displayValue(
                            item.producer
                          )}
                        </dd>
                      </div>
                    </dl>
                  </td>

                  <td className="p-3">
                    {displayValue(item.staff)}
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
                        statusStyle[
                          item.status
                        ] ??
                        "border-gray-300 bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabel[
                        item.status
                      ] ?? item.status}
                    </span>
                  </td>

                  <td className="p-3">
                    {item.input_completed ? (
                      <span className="inline-block whitespace-nowrap rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                        入力済
                      </span>
                    ) : item.status ===
                      "sold" ? (
                      <span className="inline-block whitespace-nowrap rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                        未入力
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="p-8 text-center text-gray-500"
                >
                  該当する商品がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {totalCount > 0 && (
        <div className="flex items-center justify-center gap-3 rounded-xl border bg-white p-4">
          {currentPage > 1 ? (
            <Link
              href={createPageUrl(
                currentPage - 1
              )}
              className="rounded bg-gray-200 px-5 py-2 font-bold transition hover:bg-gray-300"
            >
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
            <Link
              href={createPageUrl(
                currentPage + 1
              )}
              className="rounded bg-green-700 px-5 py-2 font-bold text-white transition hover:bg-green-800"
            >
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