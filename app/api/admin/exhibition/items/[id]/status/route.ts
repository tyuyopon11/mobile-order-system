import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const formData = await request.formData();
  const status = formData.get("status")?.toString();

  if (!status || !["preparing", "selling", "sold"].includes(status)) {
    return NextResponse.redirect(
      new URL(`/admin/exhibition/${id}?error=status`, request.url)
    );
  }

  const { error } = await supabase
    .from("exhibition_items")
    .update({ status })
    .eq("id", Number(id));

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/exhibition/${id}?error=update`, request.url)
    );
  }

  if (status === "selling") {
    await supabase
      .from("exhibition_orders")
      .update({ status: "cancelled" })
      .eq("item_id", Number(id))
      .eq("status", "secured");
  }

  return NextResponse.redirect(
    new URL(`/admin/exhibition/${id}?success=status`, request.url)
  );
}