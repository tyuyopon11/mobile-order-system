import type { Metadata } from "next";

export const PUBLIC_SITE_URL = "https://mobile-order-system-black.vercel.app";
export const MARKETPLACE_DESCRIPTION = "事業者とショップをつなぎ、商品の仕入れ・販売を支えるBtoBマーケットプレイスです。";
export const BRAND_SHARE_IMAGE = `${PUBLIC_SITE_URL}/images/cirqnex-share.png`;

export function publicMetadata(title: string, description: string, path: string, image = BRAND_SHARE_IMAGE): Metadata {
  const url = new URL(path, PUBLIC_SITE_URL).href;
  let safeImage = BRAND_SHARE_IMAGE;
  try {
    const imageUrl = new URL(image, PUBLIC_SITE_URL);
    if (["https:", "http:"].includes(imageUrl.protocol)) safeImage = imageUrl.href;
  } catch {
    // Keep sharing functional if a stored image URL is malformed.
  }
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: "CIRQNEX",
      title,
      description,
      url,
      images: [{ url: safeImage, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [safeImage] },
  };
}

