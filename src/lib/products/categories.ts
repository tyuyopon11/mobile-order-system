export const PRODUCT_CATEGORIES = [
  "観葉植物",
  "観葉樹木",
  "資材",
  "花鉢",
  "花苗",
  "洋ラン",
  "その他",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

const PRODUCT_CATEGORY_SET = new Set<string>(PRODUCT_CATEGORIES);

export function isProductCategory(
  value: unknown
): value is ProductCategory {
  return typeof value === "string" && PRODUCT_CATEGORY_SET.has(value);
}
