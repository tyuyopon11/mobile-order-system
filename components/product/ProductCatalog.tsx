"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import ProductCard from "./ProductCard";
import { PRODUCT_CATEGORIES } from "@/lib/products/categories";
import type { Product } from "@/lib/types/product";

type Filters = { name: string; category: string; height: string; potSize: string };

export default function ProductCatalog({ items, filters, filterOptions, totalCount }: {
  items: Product[];
  filters: Filters;
  filterOptions: { heights: string[]; potSizes: string[] };
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const appliedKey = JSON.stringify(filters);
  const [state, setState] = useState({ appliedKey, draft: filters });
  // Keep direct links and browser Back/Forward in sync without remounting inputs.
  if (state.appliedKey !== appliedKey) setState({ appliedKey, draft: filters });
  const { name, category, height, potSize } = state.draft;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, [appliedKey]);

  function navigate(next: Filters) {
    const parameters = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value) parameters.set(key, value);
    }
    parameters.set("page", "1");
    startTransition(() => router.replace(`${pathname}?${parameters.toString()}`, { scroll: false }));
  }

  function update(key: keyof Filters, value: string, composing = false) {
    const next = { ...state.draft, [key]: value };
    setState({ appliedKey, draft: next });
    if (timer.current) clearTimeout(timer.current);
    if (composing) return;
    // Avoid a server request per keystroke; select changes apply immediately.
    if (key === "name") timer.current = setTimeout(() => navigate(next), 350);
    else navigate(next);
  }

  const selectClass =
    "min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100";

  return (
    <>
      <section className="mb-8 rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
        <fieldset disabled={isPending} aria-busy={isPending} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={name}
            onChange={(event) => update("name", event.target.value, (event.nativeEvent as InputEvent).isComposing)}
            onCompositionEnd={(event) => update("name", event.currentTarget.value)}
            placeholder="商品名で検索"
            aria-label="商品名で検索"
            className={selectClass}
          />
          <select value={category} onChange={(event) => update("category", event.target.value)} aria-label="カテゴリー" className={selectClass}>
            <option value="">カテゴリー：すべて</option>
            {category && !PRODUCT_CATEGORIES.some(value => value === category) && <option value={category}>{category}</option>}
            {PRODUCT_CATEGORIES.map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={height} onChange={(event) => update("height", event.target.value)} aria-label="樹高" className={selectClass}>
            <option value="">樹高：すべて</option>
            {height && !filterOptions.heights.includes(height) && <option value={height}>{height}</option>}
            {filterOptions.heights.map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={potSize} onChange={(event) => update("potSize", event.target.value)} aria-label="鉢サイズ" className={selectClass}>
            <option value="">鉢サイズ：すべて</option>
            {potSize && !filterOptions.potSizes.includes(potSize) && <option value={potSize}>{potSize}</option>}
            {filterOptions.potSizes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </fieldset>
        <p aria-live="polite" className="mt-3 text-xs text-stone-500">{isPending ? "絞り込み中…" : `${totalCount}件の商品`}</p>
      </section>

      {items.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {items.map((item) => <ProductCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center text-sm text-stone-500">
          条件に一致する商品がありません。
        </div>
      )}
    </>
  );
}
