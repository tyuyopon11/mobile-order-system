export const SHOP_PUBLICATION_COLUMN = "published" as const;

export type ShopPublication = {
  published: boolean | null | undefined;
};

export type PublicSiteShop = ShopPublication & {
  show_on_public_site: boolean | null | undefined;
};

export function isShopPublished(shop: ShopPublication | null | undefined) {
  return shop?.published === true;
}

export function isShopListedOnPublicSite(
  shop: Pick<PublicSiteShop, "show_on_public_site"> | null | undefined
) {
  return shop?.show_on_public_site === true;
}

export function isShopPubliclyAccessible(
  shop: PublicSiteShop | null | undefined
) {
  return isShopListedOnPublicSite(shop) && isShopPublished(shop);
}
