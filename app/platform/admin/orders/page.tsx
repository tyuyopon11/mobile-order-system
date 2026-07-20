import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ShopRow = {
  shop_name: string | null;
};

type ItemRow = {
  id: string | number;
  product_name: string | null;
  price: number | null;
  shops: ShopRow | ShopRow[] | null;
};

type OrderRow = {
  id: string | number;
  item_id: string | number | null;
  buyer_no: string | null;
  branch_no: string | null;
  buyer_name: string | null;
  contact_name: string | null;
  contact_tel: string | null;
  email: string | null;
  quantity: number | null;
  status: string | null;
  cancelled: boolean | null;
  delivery_date: string | null;
  ordered_at: string | null;
  exhibition_items: ItemRow | ItemRow[] | null;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return "―";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDeliveryDate(value: string | null): string {
  if (!value) {
    return "未設定";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${year}/${month}/${day}`;
}

function formatPrice(value: number | null): string {
  if (value === null) {
    return "価格未設定";
  }

  return `${value.toLocaleString("ja-JP")}円`;
}

function getItem(
  value: ItemRow | ItemRow[] | null
): ItemRow | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function getShopName(
  value: ShopRow | ShopRow[] | null
): string {
  if (Array.isArray(value)) {
    return value[0]?.shop_name ?? "ショップ未設定";
  }

  return value?.shop_name ?? "ショップ未設定";
}

function getBuyerNumber(order: OrderRow): string {
  if (order.buyer_no && order.branch_no) {
    return `${order.buyer_no}-${order.branch_no}`;
  }

  return order.buyer_no ?? "未設定";
}

function getStatusLabel(
  status: string | null,
  cancelled: boolean | null
): string {
  if (cancelled) {
    return "キャンセル";
  }

  switch (status) {
    case "secured":
      return "注文受付";
    case "processing":
      return "対応中";
    case "completed":
      return "完了";
    case "shipped":
      return "出荷済み";
    default:
      return status ?? "未設定";
  }
}

function getStatusClassName(
  status: string | null,
  cancelled: boolean | null
): string {
  if (cancelled) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  switch (status) {
    case "secured":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "processing":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "completed":
    case "shipped":
      return "border-green-200 bg-green-50 text-green-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-600";
  }
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(
      "/platform/login?next=%2Fplatform%2Fadmin%2Forders"
    );
  }

  const { data, error } = await supabase
    .from("exhibition_orders")
    .select(`
      id,
      item_id,
      buyer_no,
      branch_no,
      buyer_name,
      contact_name,
      contact_tel,
      email,
      quantity,
      status,
      cancelled,
      delivery_date,
      ordered_at,
      exhibition_items (
        id,
        product_name,
        price,
        shops (
          shop_name
        )
      )
    `)
    .order("ordered_at", {
      ascending: false,
    });

  if (error) {
    console.error("Admin orders fetch error:", error);

    return (
      <main className="min-h-screen bg-[#f5f4ef] px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-[2rem] border border-red-200 bg-white p-7 shadow-[0_18px_50px_rgba(54,65,48,0.07)]">
            <p className="text-xs font-semibold tracking-[0.24em] text-red-700">
              ERROR
            </p>

            <h1 className="mt-3 text-2xl font-semibold text-stone-900">
              注文情報を取得できませんでした
            </h1>

            <p className="mt-4 text-sm leading-7 text-stone-500">
              Supabaseの接続状態やテーブル設定をご確認ください。
            </p>
          </section>
        </div>
      </main>
    );
  }

  const orders = (data ?? []) as unknown as OrderRow[];

  const activeOrders = orders.filter(
    (order) => !order.cancelled
  );

  const securedCount = activeOrders.filter(
    (order) => order.status === "secured"
  ).length;

  const processingCount = activeOrders.filter(
    (order) => order.status === "processing"
  ).length;

  const completedCount = activeOrders.filter(
    (order) =>
      order.status === "completed" ||
      order.status === "shipped"
  ).length;

  return (
    <main className="min-h-screen bg-[#f5f4ef] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
              ORDER MANAGEMENT
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              注文管理
            </h1>

            <p className="mt-4 text-sm leading-7 text-stone-500 sm:text-base">
              Lei Portで受け付けた注文を確認できます。
            </p>
          </div>

          <Link
            href="/platform"
            className="inline-flex w-fit items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-green-800 hover:text-green-800"
          >
            Lei Portトップへ
          </Link>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="総注文数"
            value={orders.length}
          />

          <SummaryCard
            label="注文受付"
            value={securedCount}
          />

          <SummaryCard
            label="対応中"
            value={processingCount}
          />

          <SummaryCard
            label="完了・出荷済み"
            value={completedCount}
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_18px_50px_rgba(54,65,48,0.07)]">
          <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-5">
              <div>
                <h2 className="text-xl font-semibold text-stone-900">
                  注文一覧
                </h2>

                <p className="mt-1 text-sm text-stone-400">
                  新しい注文から順に表示しています。
                </p>
              </div>

              <span className="rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-600">
                {orders.length}件
              </span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-20 text-center sm:px-8">
              <div className="text-4xl">🌿</div>

              <p className="mt-5 text-lg font-semibold text-stone-800">
                現在、注文はありません
              </p>

              <p className="mt-2 text-sm text-stone-400">
                新しい注文が入ると、ここに表示されます。
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px] border-collapse">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/70 text-left">
                      <TableHeading>注文ID</TableHeading>
                      <TableHeading>注文日時</TableHeading>
                      <TableHeading>ショップ・商品</TableHeading>
                      <TableHeading>購入者</TableHeading>
                      <TableHeading>数量・金額</TableHeading>
                      <TableHeading>納品希望日</TableHeading>
                      <TableHeading>状態</TableHeading>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => {
                      const item = getItem(
                        order.exhibition_items
                      );

                      const quantity = order.quantity ?? 0;

                      const total =
                        item?.price === null ||
                        item?.price === undefined
                          ? null
                          : item.price * quantity;

                      return (
                        <tr
                          key={String(order.id)}
                          className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/60"
                        >
                          <TableCell>
                            <span className="font-semibold text-stone-900">
                              #{order.id}
                            </span>
                          </TableCell>

                          <TableCell>
                            {formatDateTime(order.ordered_at)}
                          </TableCell>

                          <TableCell>
                            <p className="text-xs font-semibold tracking-[0.08em] text-green-800">
                              {getShopName(
                                item?.shops ?? null
                              )}
                            </p>

                            <p className="mt-1 font-semibold text-stone-800">
                              {item?.product_name ??
                                "商品名未設定"}
                            </p>
                          </TableCell>

                          <TableCell>
                            <p className="font-semibold text-stone-800">
                              {order.buyer_name ?? "店名未設定"}
                            </p>

                            <p className="mt-1 text-xs text-stone-400">
                              買参番号：
                              {getBuyerNumber(order)}
                            </p>

                            <p className="mt-1 text-xs text-stone-400">
                              担当：
                              {order.contact_name ?? "未設定"}
                            </p>
                          </TableCell>

                          <TableCell>
                            <p className="font-semibold text-stone-800">
                              {quantity.toLocaleString("ja-JP")}
                              点
                            </p>

                            <p className="mt-1 text-xs text-stone-400">
                              {total === null
                                ? formatPrice(null)
                                : formatPrice(total)}
                            </p>
                          </TableCell>

                          <TableCell>
                            {formatDeliveryDate(
                              order.delivery_date
                            )}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClassName(
                                order.status,
                                order.cancelled
                              )}`}
                            >
                              {getStatusLabel(
                                order.status,
                                order.cancelled
                              )}
                            </span>
                          </TableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-stone-100 lg:hidden">
                {orders.map((order) => {
                  const item = getItem(
                    order.exhibition_items
                  );

                  const quantity = order.quantity ?? 0;

                  const total =
                    item?.price === null ||
                    item?.price === undefined
                      ? null
                      : item.price * quantity;

                  return (
                    <article
                      key={String(order.id)}
                      className="p-6 sm:p-7"
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="text-xs font-semibold text-stone-400">
                            注文 #{order.id}
                          </p>

                          <p className="mt-1 text-xs text-stone-400">
                            {formatDateTime(order.ordered_at)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClassName(
                            order.status,
                            order.cancelled
                          )}`}
                        >
                          {getStatusLabel(
                            order.status,
                            order.cancelled
                          )}
                        </span>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-semibold tracking-[0.08em] text-green-800">
                          {getShopName(item?.shops ?? null)}
                        </p>

                        <h3 className="mt-2 text-lg font-semibold text-stone-900">
                          {item?.product_name ??
                            "商品名未設定"}
                        </h3>
                      </div>

                      <dl className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm">
                        <MobileRow
                          label="店名"
                          value={
                            order.buyer_name ?? "未設定"
                          }
                        />

                        <MobileRow
                          label="買参番号"
                          value={getBuyerNumber(order)}
                        />

                        <MobileRow
                          label="担当者"
                          value={
                            order.contact_name ?? "未設定"
                          }
                        />

                        <MobileRow
                          label="注文数量"
                          value={`${quantity.toLocaleString(
                            "ja-JP"
                          )}点`}
                        />

                        <MobileRow
                          label="注文金額"
                          value={
                            total === null
                              ? formatPrice(null)
                              : formatPrice(total)
                          }
                        />

                        <MobileRow
                          label="納品希望日"
                          value={formatDeliveryDate(
                            order.delivery_date
                          )}
                        />
                      </dl>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
};

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_35px_rgba(54,65,48,0.05)]">
      <p className="text-sm text-stone-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold text-stone-900">
        {value.toLocaleString("ja-JP")}
      </p>
    </div>
  );
}

type TableHeadingProps = {
  children: React.ReactNode;
};

function TableHeading({
  children,
}: TableHeadingProps) {
  return (
    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold tracking-[0.08em] text-stone-500">
      {children}
    </th>
  );
}

type TableCellProps = {
  children: React.ReactNode;
};

function TableCell({
  children,
}: TableCellProps) {
  return (
    <td className="px-5 py-5 align-top text-sm text-stone-600">
      {children}
    </td>
  );
}

type MobileRowProps = {
  label: string;
  value: string;
};

function MobileRow({
  label,
  value,
}: MobileRowProps) {
  return (
    <div className="flex items-start justify-between gap-5">
      <dt className="shrink-0 text-stone-400">
        {label}
      </dt>

      <dd className="text-right font-medium text-stone-700">
        {value}
      </dd>
    </div>
  );
}