"use client";

import { useState } from "react";

import type { Product } from "@/lib/types/product";

type ProductGalleryProps = {
  product: Pick<
    Product,
    "number" | "name" | "image" | "images" | "quantity"
  >;
};

type GalleryImage = {
  id: string | number;
  image_url: string;
  sort_order: number | null;
};

function prepareImages(
  images: GalleryImage[],
  fallbackImage: string | null
) {
  const sortedImages = [...images]
    .filter((image) => Boolean(image.image_url))
    .sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )
    .slice(0, 6);

  if (sortedImages.length > 0) {
    return sortedImages;
  }

  if (fallbackImage) {
    return [
      {
        id: "fallback-main-image",
        image_url: fallbackImage,
        sort_order: 0,
      },
    ];
  }

  return [];
}

export default function ProductGallery({
  product,
}: ProductGalleryProps) {
  const galleryImages = prepareImages(
    product.images ?? [],
    product.image
  );

  const [selectedImageId, setSelectedImageId] = useState<
    string | number | null
  >(galleryImages[0]?.id ?? null);

  const selectedImage =
    galleryImages.find(
      (image) => image.id === selectedImageId
    ) ??
    galleryImages[0] ??
    null;

  const isSoldOut =
    product.quantity !== undefined &&
    product.quantity !== null &&
    product.quantity <= 0;

  const isOneOfAKind =
    product.quantity !== undefined &&
    product.quantity !== null &&
    product.quantity === 1;

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-gray-100 shadow">
        <div className="relative">
          {selectedImage ? (
            <img
              src={selectedImage.image_url}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center bg-gradient-to-br from-green-50 to-stone-100 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-sm">
                🌿
              </div>

              <p className="mt-5 text-lg font-semibold text-gray-700">
                商品画像準備中
              </p>

              <p className="mt-2 text-sm text-gray-500">
                商品画像は今後追加予定です
              </p>

              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-green-700">
                CIRQNEX
              </p>
            </div>
          )}

          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-gray-700 shadow-sm backdrop-blur-sm">
            No.{product.number}
          </div>

          {isOneOfAKind && !isSoldOut && (
            <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-sm">
              一点物
            </div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <div className="rounded-full bg-white px-6 py-3 text-lg font-bold text-gray-800 shadow">
                売約済み
              </div>
            </div>
          )}
        </div>
      </div>

      {galleryImages.length > 1 && (
        <div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {galleryImages.map((image, index) => {
              const isSelected =
                image.id === selectedImage?.id;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() =>
                    setSelectedImageId(image.id)
                  }
                  aria-label={`写真${index + 1}を表示`}
                  aria-pressed={isSelected}
                  className={`relative h-20 w-20 flex-none overflow-hidden rounded-xl border-2 bg-gray-100 transition sm:h-24 sm:w-24 ${
                    isSelected
                      ? "border-green-700 ring-2 ring-green-100"
                      : "border-transparent hover:border-green-300"
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${product.name} 写真${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
