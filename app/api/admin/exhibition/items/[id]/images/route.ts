import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const itemId = Number(id);

    if (!itemId) {
      return NextResponse.json(
        { error: "商品IDが不正です。" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "画像ファイルが選択されていません。" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${itemId}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("exhibition-images")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "画像アップロードに失敗しました。" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("exhibition-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    const { data: existingImages } = await supabaseAdmin
      .from("exhibition_images")
      .select("id")
      .eq("item_id", itemId);

    const sortOrder = existingImages?.length ?? 0;

    const { error: insertError } = await supabaseAdmin
      .from("exhibition_images")
      .insert({
        item_id: itemId,
        image_url: imageUrl,
        sort_order: sortOrder,
      });

    if (insertError) {
      return NextResponse.json(
        { error: "画像情報の登録に失敗しました。" },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("exhibition_items")
      .update({ status: "selling" })
      .eq("id", itemId)
      .eq("status", "preparing");

    return NextResponse.json({
      message: "写真を登録しました。",
      imageUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "写真登録中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}