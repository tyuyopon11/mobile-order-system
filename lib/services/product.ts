import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { calculateAvailableCases } from "@/lib/products/inventory";
import {
  isShopPubliclyAccessible,
  SHOP_PUBLICATION_COLUMN,
} from "@/lib/shops/publication";

import type {
  Product,
  ProductImage,
  ProductShop,
} from "@/lib/types/product";

type ExhibitionImageRow = {
  id: string | number;
  image_url: string;
  sort_order: number | null;
};

type ShopRow = {
  id: string;
  shop_name: string;
  slug: string;
  ordering_enabled: boolean;
  accepts_tuesday: boolean;
  accepts_saturday: boolean;
  order_cutoff_hours: number;
  published: boolean;
  show_on_public_site: boolean;
};

function sortImages(
  images: ExhibitionImageRow[] | null | undefined
): ProductImage[] {
  return [...(images ?? [])]
    .sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )
    .slice(0, 6)
    .map((image) => ({
      id: image.id,
      image_url: image.image_url,
      sort_order: image.sort_order,
    }));
}

function nullableText(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text === "" ? null : text;
}

function nullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function mapProduct(
  item: any,
  shop?: ProductShop
): Product {
  const images = sortImages(item.exhibition_images);

  return {
    id: item.id,
    number: item.item_no,

    name: nullableText(item.product_name) ?? "商品名未設定",

    category: nullableText(item.category),
    item: nullableText(item.item),
    variety: nullableText(item.variety),

    tree_height: nullableText(item.tree_height),
    tree_shape: nullableText(item.tree_shape),
    pot_size: nullableText(item.pot_size),

    quantity: calculateAvailableCases(item.quantity, item.exhibition_orders),
    price: nullableNumber(item.price),
    irisu: Math.max(
      1,
      Math.trunc(
        nullableNumber(item.irisu) ??
          nullableNumber(item.units_per_sales_unit) ??
          1
      )
    ),
    sales_unit: "case",
    units_per_sales_unit: Math.max(
      1,
      Math.trunc(
        nullableNumber(item.irisu) ??
          nullableNumber(item.units_per_sales_unit) ??
          1
      )
    ),
    sales_period_enabled: item.sales_period_enabled === true,
    sales_start_date: nullableText(item.sales_start_date),
    sales_end_date: nullableText(item.sales_end_date),

    origin: nullableText(item.origin),
    producer: nullableText(item.producer),
    staff: nullableText(item.staff),

    comment: nullableText(item.comment),
    jf_code: nullableText(item.jf_code),

    image: images[0]?.image_url ?? null,
    images,

    shop:
      shop ??
      ({
        id: "",
        shop_name: "",
        slug: "",
        ordering_enabled: false,
        accepts_tuesday: false,
        accepts_saturday: false,
        order_cutoff_hours: 24,
      } satisfies ProductShop),
  };
}

export async function getShopItems(
  shopId: string,
  page: number = 1,
  pageSize: number = 30
) {
  console.log("★★★★ shopId =", shopId);

  const supabase = supabaseAdmin;

  const { data: publicShop, error: shopError } = await supabase
    .from("shops")
    .select("id")
    .eq("id", shopId)
    .eq(SHOP_PUBLICATION_COLUMN, true)
    .eq("show_on_public_site", true)
    .maybeSingle();

  if (shopError || !publicShop) {
    throw new Error("Shop is not publicly available.");
  }

  const safePage =
    Number.isInteger(page) && page > 0 ? page : 1;

  const safePageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? pageSize
      : 30;

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await supabase
    .from("exhibition_items")
    .select(
      `
        id,
        item_no,
        product_name,
        category,
        item,
        variety,
        tree_height,
        tree_shape,
        pot_size,
        quantity,
        price,
        irisu,
        sales_unit,
        units_per_sales_unit,
        sales_period_enabled,
        sales_start_date,
        sales_end_date,
        origin,
        producer,
        staff,
        comment,
        jf_code,
        exhibition_images (
          id,
          image_url,
          sort_order
        ),
        exhibition_orders (
          quantity,
          status,
          cancelled
        )
      `,
      {
        count: "exact",
      }
    )
    .eq("shop_id", shopId)
    .eq("published", true)
    .order("item_no", {
      ascending: true,
    })
    .range(from, to);

  if (error) {
    console.error("Shop items fetch error:", error);

    throw new Error(
      "ショップの商品情報を取得できませんでした。"
    );
  }

  const items: Product[] =
    data?.map((item: any) => mapProduct(item)) ?? [];

  const totalCount = count ?? 0;

  return {
    items,
    totalCount,
    totalPages: Math.max(
      Math.ceil(totalCount / safePageSize),
      1
    ),
    currentPage: safePage,
    pageSize: safePageSize,
  };
}

export async function getProduct(
  id: string
): Promise<Product> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("exhibition_items")
    .select(
      `
        id,
        item_no,
        product_name,
        category,
        item,
        variety,
        tree_height,
        tree_shape,
        pot_size,
        quantity,
        price,
        irisu,
        sales_unit,
        units_per_sales_unit,
        sales_period_enabled,
        sales_start_date,
        sales_end_date,
        origin,
        producer,
        staff,
        comment,
        jf_code,
        exhibition_images (
          id,
          image_url,
          sort_order
        ),
        exhibition_orders (
          quantity,
          status,
          cancelled
        ),
        shops (
          id,
          shop_name,
          slug,
          ordering_enabled,
          accepts_tuesday,
          accepts_saturday,
          order_cutoff_hours,
          published,
          show_on_public_site
        )
      `
    )
    .eq("id", id)
    .eq("published", true)
    .single();

  if (error || !data) {
    console.error("Product fetch error:", error);

    throw new Error(
      "商品情報を取得できませんでした。"
    );
  }

  const rawShop = data.shops as
    | ShopRow
    | ShopRow[]
    | null;

  const shopRow = Array.isArray(rawShop)
    ? rawShop[0]
    : rawShop;

  if (!shopRow || !isShopPubliclyAccessible(shopRow)) {
    throw new Error(
      "この商品に紐づくショップ情報がありません。"
    );
  }

  const shop: ProductShop = {
    id: String(shopRow.id),
    shop_name: shopRow.shop_name,
    slug: shopRow.slug,
    ordering_enabled: shopRow.ordering_enabled,
    accepts_tuesday: shopRow.accepts_tuesday,
    accepts_saturday: shopRow.accepts_saturday,
    order_cutoff_hours: shopRow.order_cutoff_hours,
  };

  return mapProduct(data, shop);
}
