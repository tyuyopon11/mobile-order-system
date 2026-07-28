const TOKYO_TIME_ZONE = "Asia/Tokyo";

function datePartsInTokyo(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TOKYO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  ) as Record<string, string>;
}

export function todayInTokyo(now = new Date()) {
  const parts = datePartsInTokyo(now);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDays(dateText: string, days: number) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function auctionWeekday(dateText: string) {
  return new Date(`${dateText}T00:00:00Z`).getUTCDay();
}

export function auctionCutoffAt(dateText: string, cutoffHours: number) {
  const auctionAt = new Date(`${dateText}T00:00:00+09:00`);
  return new Date(
    auctionAt.getTime() - Math.max(0, cutoffHours) * 60 * 60 * 1000
  );
}

export function isShopAuctionDate(
  dateText: string,
  options: {
    orderingEnabled: boolean;
    acceptsTuesday: boolean;
    acceptsSaturday: boolean;
    cutoffHours: number;
    now?: Date;
  }
) {
  if (!options.orderingEnabled) return false;

  const day = auctionWeekday(dateText);
  const accepted =
    (day === 2 && options.acceptsTuesday) ||
    (day === 6 && options.acceptsSaturday);

  return accepted && (options.now ?? new Date()) < auctionCutoffAt(
    dateText,
    options.cutoffHours
  );
}

export function generateFallbackAuctionDates(days = 90) {
  const today = todayInTokyo();
  return Array.from({ length: days }, (_, index) => addDays(today, index + 1))
    .filter((date) => {
      const day = auctionWeekday(date);
      return day === 2 || day === 6;
    });
}
