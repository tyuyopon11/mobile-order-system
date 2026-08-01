import { NextRequest, NextResponse } from "next/server";
import { getShopAccess } from "@/lib/auth/shop-access";
import { getShopOrders } from "@/lib/orders/shop-orders";

function csv(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export async function GET(request: NextRequest) {
  const access = await getShopAccess();
  if (!access) return NextResponse.json({ error: "権限がありません。" }, { status: 403 });
  const date = request.nextUrl.searchParams.get("auction_date") ?? "";
  const number = request.nextUrl.searchParams.get("order_number") ?? "";
  if (!date && !number) return NextResponse.json({ error: "競り日または注文番号を指定してください。" }, { status: 400 });

  let orders;
  try {
    orders = await getShopOrders(access.shopId, { auctionDate: date || undefined, orderNumber: number || undefined, orderBy: "buyer" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "注文を取得できませんでした。" }, { status: 500 });
  }
  if (!orders.length) return NextResponse.json({ error: "対象注文がありません。" }, { status: 404 });

  const header = ["注文番号", "競り日", "買参番号", "枝番", "会社名", "商品番号", "商品名", "ケース数", "入数", "総鉢数", "単価", "金額", "コメント"];
  const rows = orders.map((order) => { const cases=Number(order.quantity??0);const irisu=Number(order.irisu??1);const price=Number(order.item.price??0);return [order.order_number??order.id,order.auction_date,order.buyer_no,order.branch_no,order.buyer_name,order.item.item_no,order.item.product_name,cases,irisu,cases*irisu,price,cases*price,order.note]; });
  const body = `\uFEFF${[header,...rows].map((row)=>row.map(csv).join(",")).join("\r\n")}\r\n`;
  return new NextResponse(body,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="lei-port-${date||number}.csv"`,"Cache-Control":"no-store"}});
}
