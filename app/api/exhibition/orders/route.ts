import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isProductInSalesPeriod } from "@/lib/products/sales-period";
import { calculateLineAmount, calculateTotalUnits } from "@/lib/orders/amounts";

export async function POST(request: Request) {
  const supabase = await createClient();

  const formData = await request.formData();

  const itemId = formData.get("item_id")?.toString();
  const buyerNo = formData.get("buyer_no")?.toString();
  const branch = formData.get("branch")?.toString();
  const buyerName = formData.get("buyer_name")?.toString();
  const contact = formData.get("contact")?.toString();
  const password = formData.get("password")?.toString();

  const buildRedirectUrl = (status: "success" | "error", value: string) => {
    const url = new URL("/exhibition", request.url);

    if (buyerNo) url.searchParams.set("buyer_no", buyerNo);
    if (branch) url.searchParams.set("branch", branch);
    if (buyerName) url.searchParams.set("buyer_name", buyerName);
    if (contact) url.searchParams.set("contact", contact);
    if (password) url.searchParams.set("password", password);

    url.searchParams.set(status, value);

    return url;
  };

  if (!itemId || !buyerNo || !branch || !buyerName || !contact || !password) {
    return NextResponse.redirect(buildRedirectUrl("error", "missing"));
  }

  const { data: item, error: itemError } = await supabase
    .from("exhibition_items")
    .select("id,status,price,irisu,sales_period_enabled,sales_start_date,sales_end_date")
    .eq("id", Number(itemId))
    .single();

  if (itemError || !item) {
    return NextResponse.redirect(buildRedirectUrl("error", "item"));
  }

  if (item.status === "sold") {
    return NextResponse.redirect(buildRedirectUrl("error", "sold"));
  }

  if (!isProductInSalesPeriod(item)) {
    return NextResponse.redirect(buildRedirectUrl("error", "sales_period"));
  }

  const { error: orderError } = await supabase.from("exhibition_orders").insert({
    item_id: Number(itemId),
    buyer_no: buyerNo,
    branch,
    buyer_name: buyerName,
    contact,
    quantity: 1,
    irisu: Number(item.irisu ?? 1),
    units_per_sales_unit: Number(item.irisu ?? 1),
    total_units: calculateTotalUnits(Number(item.irisu ?? 1), 1),
    unit_price: Number(item.price ?? 0),
    total_amount: calculateLineAmount({ unitPrice: Number(item.price ?? 0), unitsPerSalesUnit: Number(item.irisu ?? 1), quantity: 1 }),
    status: "secured",
  });

  if (orderError) {
    return NextResponse.redirect(buildRedirectUrl("error", "order"));
  }

  const { error: updateError } = await supabase
    .from("exhibition_items")
    .update({ status: "sold" })
    .eq("id", Number(itemId));

  if (updateError) {
    return NextResponse.redirect(buildRedirectUrl("error", "update"));
  }

  return NextResponse.redirect(buildRedirectUrl("success", "1"));
}
