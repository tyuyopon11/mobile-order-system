import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ShopOrderFilters = {
  auctionDate?: string;
  orderNumber?: string;
  search?: string;
  orderBy?: "newest" | "buyer";
};

export type ShopOrderItem = {
  id: number;
  item_no: number | null;
  product_name: string | null;
  price: number | null;
};

export type ShopOrder = {
  id: number;
  order_number: string | null;
  auction_date: string | null;
  ordered_at: string;
  buyer_no: string | null;
  branch_no: string | null;
  buyer_name: string | null;
  contact_name: string | null;
  quantity: number | null;
  irisu: number | null;
  item_id: number;
  note: string | null;
  item: ShopOrderItem;
};

/** Vendorの受注一覧とCSVで共用するショップスコープ取得処理。 */
export async function getShopOrders(
  shopId: string,
  filters: ShopOrderFilters = {}
): Promise<ShopOrder[]> {
  const { data: items, error: itemError } = await supabaseAdmin
    .from("exhibition_items")
    .select("id,item_no,product_name,price")
    .eq("shop_id", shopId);
  if (itemError) throw new Error(itemError.message);

  const itemRows = (items ?? []) as ShopOrderItem[];
  const itemIds = itemRows.map((item) => item.id);
  if (!itemIds.length) return [];

  let query = supabaseAdmin
    .from("exhibition_orders")
    .select("id,order_number,auction_date,ordered_at,buyer_no,branch_no,buyer_name,contact_name,quantity,irisu,item_id,note")
    .in("item_id", itemIds)
    .eq("cancelled", false);

  if (filters.auctionDate) query = query.eq("auction_date", filters.auctionDate);
  if (filters.orderNumber) {
    const legacyId = Number(filters.orderNumber);
    query = filters.orderNumber.startsWith("LP")
      ? query.eq("order_number", filters.orderNumber)
      : Number.isSafeInteger(legacyId)
        ? query.eq("id", legacyId)
        : query.eq("order_number", filters.orderNumber);
  }
  if (filters.search) {
    const search = filters.search.replaceAll(",", "");
    query = query.or(`order_number.ilike.%${search}%,buyer_no.ilike.%${search}%,buyer_name.ilike.%${search}%,contact_name.ilike.%${search}%`);
  }
  query = filters.orderBy === "buyer"
    ? query.order("buyer_no", { ascending: true })
    : query.order("ordered_at", { ascending: false });

  const { data: orders, error: orderError } = await query;
  if (orderError) throw new Error(orderError.message);

  const itemMap = new Map(itemRows.map((item) => [String(item.id), item]));
  return (orders ?? []).flatMap((order) => {
    const item = itemMap.get(String(order.item_id));
    return item ? [{ ...order, item } as ShopOrder] : [];
  });
}
