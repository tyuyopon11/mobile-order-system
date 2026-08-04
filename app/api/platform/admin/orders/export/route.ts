import { NextRequest, NextResponse } from "next/server";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { createClient } from "@/lib/supabase/server";
import { calculateTotalUnits, resolveOrderAmount, resolveOrderUnitPrice } from "@/lib/orders/amounts";

type ItemRow = {
  item_no: number | null;
  product_name: string | null;
  price: number | null;
  shops: { shop_name: string | null } | { shop_name: string | null }[] | null;
};

type CsvOrder = {
  id: number;
  order_number: string | null;
  auction_date: string | null;
  buyer_no: string | null;
  branch_no: string | null;
  buyer_name: string | null;
  contact_name: string | null;
  quantity: number | null;
  irisu: number;
  note: string | null;
  unit_price: number | null;
  total_amount: number | null;
  exhibition_items: ItemRow | ItemRow[] | null;
};

const HEADERS = [
  "注文番号",
  "競り日",
  "ショップ名",
  "買参番号",
  "枝番",
  "会社名",
  "商品番号",
  "商品名",
  "ケース数",
  "入数",
  "総鉢数",
  "単価",
  "金額",
  "コメント",
] as const;

function escapeCsv(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function excelIdentifier(value: string | null) {
  if (!value) return "";
  return /^\d+$/.test(value) ? `="${value}"` : value;
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function safeFilePart(value: string) {
  return value.replace(/[^0-9A-Za-z_-]/g, "-");
}

export async function GET(request: NextRequest) {
  const access = await getPlatformAccess();
  if (!isApprovedPlatformAdmin(access)) {
    return NextResponse.json({ error: "権限がありません。" }, { status: 403 });
  }

  const auctionDate = request.nextUrl.searchParams.get("auction_date")?.trim() ?? "";
  const orderNumber = request.nextUrl.searchParams.get("order_number")?.trim() ?? "";

  if (!auctionDate && !orderNumber) {
    return NextResponse.json(
      { error: "競り日または注文番号を指定してください。" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  let query = supabase
    .from("exhibition_orders")
    .select(`
      id,order_number,auction_date,buyer_no,branch_no,buyer_name,
      contact_name,quantity,irisu,note,unit_price,total_amount,
      exhibition_items(item_no,product_name,price,shops(shop_name))
    `)
    .eq("cancelled", false)
    .order("buyer_no", { ascending: true })
    .order("branch_no", { ascending: true })
    .order("order_number", { ascending: true });

  if (auctionDate) query = query.eq("auction_date", auctionDate);
  if (orderNumber) {
    const numericId = Number(orderNumber);
    query = orderNumber.startsWith("LP") || !Number.isSafeInteger(numericId)
      ? query.eq("order_number", orderNumber)
      : query.eq("id", numericId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = (data ?? []) as unknown as CsvOrder[];
  if (orders.length === 0) {
    return NextResponse.json(
      { error: "出力対象の注文がありません。" },
      { status: 404 }
    );
  }

  const rows = orders.map((order) => {
    const item = one(order.exhibition_items);
    const cases = Number(order.quantity ?? 0);
    const irisu = Number(order.irisu ?? 1);
    const totalPots = calculateTotalUnits(irisu, cases);
    const unitPrice = resolveOrderUnitPrice(order.unit_price, item?.price);
    const amount = resolveOrderAmount({ savedAmount: order.total_amount, savedUnitPrice: order.unit_price, currentProductPrice: item?.price, unitsPerSalesUnit: irisu, quantity: cases });
    const shop = one(item?.shops ?? null);
    return [
      order.order_number ?? order.id,
      order.auction_date,
      shop?.shop_name,
      excelIdentifier(order.buyer_no),
      excelIdentifier(order.branch_no),
      order.buyer_name,
      item?.item_no,
      item?.product_name,
      cases,
      irisu,
      totalPots,
      unitPrice,
      amount,
      order.note,
    ];
  });

  const csv = [HEADERS, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
  const fileKey = safeFilePart(auctionDate || orderNumber);
  const body = `\uFEFF${csv}\r\n`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lei-port-shipping-${fileKey}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
