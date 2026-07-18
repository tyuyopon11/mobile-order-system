import {
  marketTheme,
  producerTheme,
  takashimayaTheme,
  wholesalerTheme,
} from "./themes";

import type {
  ShopIdentity,
  ShopTheme,
  ShopType,
} from "./types";

export type {
  ShopIdentity,
  ShopTheme,
  ShopType,
} from "./types";

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function resolveShopType(shop: ShopIdentity): ShopType {
  const explicitType = normalize(shop.type);

  if (
    explicitType === "takashimaya" ||
    explicitType === "market" ||
    explicitType === "producer" ||
    explicitType === "wholesaler"
  ) {
    return explicitType;
  }

  const shopName = normalize(shop.shop_name);
  const slug = normalize(shop.slug);

  if (
    shopName.includes("高島屋") ||
    slug.includes("takashimaya")
  ) {
    return "takashimaya";
  }

  return "market";
}

export function getShopTheme(
  shop: ShopIdentity
): ShopTheme {
  const type = resolveShopType(shop);

  switch (type) {
    case "takashimaya":
      return takashimayaTheme;

    case "producer":
      return producerTheme;

    case "wholesaler":
      return wholesalerTheme;

    case "market":
    default:
      return marketTheme;
  }
}
