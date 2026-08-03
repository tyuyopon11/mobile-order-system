import { isProductCategory } from "@/lib/products/categories";

export type ProductPublicationInput = {
  name: string | null | undefined;
  category: string | null | undefined;
  irisu: number | null | undefined;
  price: number | null | undefined;
};

export function getProductPublicationErrors(
  input: ProductPublicationInput
): string[] {
  const errors: string[] = [];
  if (!input.name?.trim()) errors.push("商品名");
  if (!isProductCategory(input.category)) errors.push("カテゴリー");
  if (!Number.isInteger(Number(input.irisu)) || Number(input.irisu) < 1) {
    errors.push("ケース入数");
  }
  if (!Number.isFinite(Number(input.price)) || Number(input.price) <= 0) {
    errors.push("税抜価格（1円以上）");
  }
  return errors;
}

export function canPublishProduct(input: ProductPublicationInput): boolean {
  return getProductPublicationErrors(input).length === 0;
}
