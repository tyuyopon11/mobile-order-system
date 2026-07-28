"use client";

import { useState, useTransition } from "react";

import { toggleFavoriteShop } from "./actions";

export default function FavoriteShopButton({
  shopId,
  initialFavorite,
}: {
  shopId: string;
  initialFavorite: boolean;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={favorite}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleFavoriteShop(shopId);
          if (!result.error) setFavorite(result.favorite);
        })
      }
      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-60"
    >
      {favorite ? "♥ お気に入り中" : "♡ お気に入り"}
    </button>
  );
}
