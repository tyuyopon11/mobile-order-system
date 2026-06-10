import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    imageId: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  const { imageId } = await params;
  const supabase = await createClient();

  const formData = await request.formData();
  const itemId = formData.get("item_id")?.toString();

  if (!itemId) {
    return NextResponse.redirect(
      new URL("/admin/exhibition?error=image-delete", request.url)
    );
  }

  const { data: image, error: fetchError } = await supabase
    .from("exhibition_images")
    .select("*")
    .eq("id", Number(imageId))
    .single();

  if (fetchError || !image) {
    return NextResponse.redirect(
      new URL(`/admin/exhibition/${itemId}?error=image-delete`, request.url)
    );
  }

  const { error: dbError } = await supabase
    .from("exhibition_images")
    .delete()
    .eq("id", Number(imageId));

  if (dbError) {
    return NextResponse.redirect(
      new URL(`/admin/exhibition/${itemId}?error=image-delete`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/admin/exhibition/${itemId}?success=image-delete`, request.url)
  );
}