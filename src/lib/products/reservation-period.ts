import { formatSalesPeriodDate, todayInTokyo } from "@/lib/products/sales-period";

export type ProductReservationPeriod = {
  reservation_period_enabled: boolean | null | undefined;
  reservation_start_date: string | null | undefined;
  reservation_end_date: string | null | undefined;
};

export type ProductReservationStatus = "unrestricted" | "not_started" | "active" | "ended";

export function getProductReservationStatus(
  period: ProductReservationPeriod,
  today = todayInTokyo()
): ProductReservationStatus {
  if (!period.reservation_period_enabled) return "unrestricted";
  if (!period.reservation_start_date || !period.reservation_end_date) return "not_started";
  if (today < period.reservation_start_date) return "not_started";
  if (today > period.reservation_end_date) return "ended";
  return "active";
}

export function isProductReservationOpen(period: ProductReservationPeriod, today?: string) {
  const status = getProductReservationStatus(period, today);
  return status === "unrestricted" || status === "active";
}

export function getProductReservationStatusLabel(status: ProductReservationStatus) {
  if (status === "not_started") return "予約受付開始前";
  if (status === "active") return "予約受付中";
  if (status === "ended") return "予約受付終了";
  return "予約受付中";
}

export function formatProductReservationPeriod(period: ProductReservationPeriod) {
  if (!period.reservation_period_enabled || !period.reservation_start_date || !period.reservation_end_date) return null;
  return `${formatSalesPeriodDate(period.reservation_start_date)}〜${formatSalesPeriodDate(period.reservation_end_date)}`;
}

export function validateProductReservationPeriod(period: ProductReservationPeriod): string | null {
  if (!period.reservation_period_enabled) return null;
  if (!period.reservation_start_date || !period.reservation_end_date) return "予約受付期間を設定する場合は、受付開始日と受付終了日を入力してください。";
  if (period.reservation_end_date < period.reservation_start_date) return "受付終了日は受付開始日以降の日付を入力してください。";
  return null;
}

export function parseProductReservationPeriod(formData: FormData): ProductReservationPeriod {
  const enabled = formData.get("reservationPeriodEnabled") === "on";
  return {
    reservation_period_enabled: enabled,
    reservation_start_date: enabled ? String(formData.get("reservationStartDate") ?? "").trim() || null : null,
    reservation_end_date: enabled ? String(formData.get("reservationEndDate") ?? "").trim() || null : null,
  };
}
