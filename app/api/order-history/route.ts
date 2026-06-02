import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function normalizePhone(value: string) {
  return String(value || "").replace(/[^\d]/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const buyerNo = String(body.buyer_no || "").trim();
    const buyerBranchNo = String(body.buyer_branch_no || "").trim();
    const contactPhone = normalizePhone(String(body.contact_phone || ""));

    if (!buyerNo || !buyerBranchNo || !contactPhone) {
      return NextResponse.json(
        { error: "買参番号・枝番・連絡先を入力してください" },
        { status: 400 }
      );
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data: orders, error: orderError } = await supabase
      .from("mobile_orders")
      .select("*")
      .eq("buyer_no", buyerNo)
      .eq("buyer_branch_no", buyerBranchNo)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const matchedOrders = (orders || []).filter(
      (order) => normalizePhone(order.contact_phone || "") === contactPhone
    );

    const orderIds = matchedOrders.map((order) => order.id);

    if (orderIds.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const { data: items, error: itemError } = await supabase
      .from("mobile_order_items")
      .select("*")
      .in("order_id", orderIds)
      .order("display_order", { ascending: true });

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    const result = matchedOrders.map((order) => ({
      ...order,
      items: (items || []).filter((item) => item.order_id === order.id),
    }));

    return NextResponse.json({ orders: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "注文履歴取得エラー" },
      { status: 500 }
    );
  }
}