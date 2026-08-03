"use client";

import { useMemo, useState } from "react";

import ProductCard from "./ProductCard";
import { PRODUCT_CATEGORIES } from "@/lib/products/categories";
import type { Product } from "@/lib/types/product";

export default function ProductCatalog({ items }: { items: Product[] }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [height, setHeight] = useState("");
  const [potSize, setPotSize] = useState("");

  const options = (key: "category" | "tree_height" | "pot_size") =>
    Array.from(new Set(items.map((item) => item[key]).filter(Boolean) as string[]))
      .sort((a, b) => a.localeCompare(b, "ja"));

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          item.name.toLocaleLowerCase("ja").includes(name.toLocaleLowerCase("ja")) &&
          (!category || item.category === category) &&
          (!height || item.tree_height === height) &&
          (!potSize || item.pot_size === potSize)
      ),
    [items, name, category, height, potSize]
  );

  const selectClass =
    "min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100";

  return (
    <>
      <section className="mb-8 rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="商品名で検索"
            aria-label="商品名で検索"
            className={selectClass}
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="カテゴリー" className={selectClass}>
            <option value="">カテゴリー：すべて</option>
            {PRODUCT_CATEGORIES.map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={height} onChange={(event) => setHeight(event.target.value)} aria-label="樹高" className={selectClass}>
            <option value="">樹高：すべて</option>
            {options("tree_height").map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={potSize} onChange={(event) => setPotSize(event.target.value)} aria-label="鉢サイズ" className={selectClass}>
            <option value="">鉢サイズ：すべて</option>
            {options("pot_size").map((value) => <option key={value}>{value}</option>)}
          </select>
        </div>
        <p className="mt-3 text-xs text-stone-500">{filtered.length}件の商品</p>
      </section>

      {filtered.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {filtered.map((item) => <ProductCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center text-sm text-stone-500">
          条件に一致する商品がありません。
        </div>
      )}
    </>
  );
}
