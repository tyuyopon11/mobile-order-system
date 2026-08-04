export type ProductSalesPeriod = {
  sales_period_enabled: boolean | null | undefined;
  sales_start_date: string | null | undefined;
  sales_end_date: string | null | undefined;
};

export type ProductSalesPeriodStatus =
  | "unrestricted"
  | "not_started"
  | "active"
  | "ended";

export function todayInTokyo(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function getProductSalesPeriodStatus(
  period: ProductSalesPeriod,
  today = todayInTokyo()
): ProductSalesPeriodStatus {
  if (!period.sales_period_enabled) return "unrestricted";
  if (!period.sales_start_date || !period.sales_end_date) return "not_started";
  if (today < period.sales_start_date) return "not_started";
  if (today > period.sales_end_date) return "ended";
  return "active";
}

export function isProductInSalesPeriod(period: ProductSalesPeriod, today?: string) {
  const status = getProductSalesPeriodStatus(period, today);
  return status !== "ended";
}

export function isAuctionDateWithinProductSalesPeriod(
  period: ProductSalesPeriod,
  auctionDate: string
) {
  if (!period.sales_period_enabled) return true;
  if (!period.sales_start_date || !period.sales_end_date) return false;
  return auctionDate >= period.sales_start_date && auctionDate <= period.sales_end_date;
}

export function validateProductSalesPeriod(period: ProductSalesPeriod): string | null {
  if (!period.sales_period_enabled) return null;
  if (!period.sales_start_date || !period.sales_end_date) {
    return "販売期間を設定する場合は、開始日と終了日を入力してください。";
  }
  if (period.sales_end_date < period.sales_start_date) {
    return "販売終了日は販売開始日以降の日付を入力してください。";
  }
  return null;
}

export function getProductSalesStatusLabel(status: ProductSalesPeriodStatus) {
  if (status === "not_started") return "予約受付中";
  if (status === "ended") return "販売終了";
  return "販売中";
}

export function formatSalesPeriodDate(value: string) {
  const [, month, day] = value.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

export function formatProductSalesPeriod(period: ProductSalesPeriod) {
  if (!period.sales_period_enabled || !period.sales_start_date || !period.sales_end_date) {
    return null;
  }
  return `${formatSalesPeriodDate(period.sales_start_date)}〜${formatSalesPeriodDate(period.sales_end_date)}`;
}

export function parseProductSalesPeriod(formData: FormData): ProductSalesPeriod {
  const enabled = formData.get("salesPeriodEnabled") === "on";
  return {
    sales_period_enabled: enabled,
    sales_start_date: enabled ? String(formData.get("salesStartDate") ?? "").trim() || null : null,
    sales_end_date: enabled ? String(formData.get("salesEndDate") ?? "").trim() || null : null,
  };
}
